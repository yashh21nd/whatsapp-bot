import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";
import { Client } from "whatsapp-web.js";
import qrcode from "qrcode-terminal";
import { saveMessage, getMessages } from "./models/messages.js";
import { getRules, addRule, updateRule, deleteRule } from "./models/rules.js";
import { generateLLMReply } from "./services/llm.js";

// Load environment variables
dotenv.config();

// Express setup
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: process.env.DASHBOARD_ORIGIN || "http://localhost:5173" }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

// --- Middleware ---
const requireAdmin = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1] || req.query.token;
  if (token === process.env.ADMIN_TOKEN) return next();
  res.status(401).json({ error: "Unauthorized" });
};

// --- WhatsApp Client ---
const client = new Client({
    puppeteer: {
        args: ['--no-sandbox'],
    }
});

let lastQR = null;
let ready = false;

// WhatsApp client event handlers
client.on('qr', async (qr) => {
    try {
        // Display QR in terminal for debugging
        qrcode.generate(qr, { small: true });
        
        // Save QR code
        lastQR = qr;
        ready = false;
        
        // Send QR to all connected clients
        io.emit('whatsapp:qr', qr);
        io.emit('whatsapp:ready', false);
        
        console.log('New QR code generated and sent to frontend');
    } catch (error) {
        console.error('Error handling QR code:', error);
    }
});

client.on('ready', () => {
    console.log('Client is ready!');
    ready = true;
    io.emit('whatsapp:ready', true);
});

// Message handling
client.on('message', async (msg) => {
    if (msg.fromMe) return;
    const chatId = msg.from;

    // Save incoming message for dashboard
    await saveMessage(chatId, msg.from, "me", msg.body, "in", "incoming");
    io.emit("message:new", {
        chatId,
        from: msg.from,
        body: msg.body,
        direction: "in",
        at: Date.now(),
    });

    // Convert message to lowercase for case-insensitive commands
    const messageText = msg.body.toLowerCase();

    // Basic command handling
    if (messageText.startsWith('!')) {
        switch(messageText) {
            case '!ping':
                await msg.reply('pong');
                break;
            case '!help':
                const helpMessage = `Available commands:
- !ping - Check if bot is alive
- !info - Get information about the bot
- !time - Get current time
- !echo <message> - Echo back your message`;
                await msg.reply(helpMessage);
                break;
            case '!time':
                await msg.reply(`Current time: ${new Date().toLocaleString()}`);
                break;
            default:
                // Handle !echo command
                if (messageText.startsWith('!echo ')) {
                    const echoText = msg.body.slice(6); // Remove !echo and space
                    if (echoText.trim()) {
                        await msg.reply(echoText);
                    }
                }
        }

        // Log command response
        await saveMessage(chatId, "me", msg.from, msg.body, "out", "command");
        return; // Don't process further if it was a command
    }

    // Check custom rules only if not a command
    const rules = await getRules();
    let matched = null;
    
    for (let r of rules) {
        if (!r.active) continue;
        if (r.isRegex) {
            try {
                if (new RegExp(r.pattern, "i").test(msg.body)) {
                    matched = r;
                    break;
                }
            } catch {}
        } else {
            if (messageText.includes(r.pattern.toLowerCase())) {
                matched = r;
                break;
            }
        }
    }

    if (matched) {
        await msg.reply(matched.reply);
        await saveMessage(chatId, "me", msg.from, matched.reply, "out", "rule");
        io.emit("reply:sent", {
            chatId,
            to: msg.from,
            body: matched.reply,
            source: "rule",
            at: Date.now(),
        });
    }
    // Removed LLM fallback to prevent unwanted responses
});

// Socket.IO auth
io.use((socket, next) => {
    const token = socket.handshake.auth?.token || socket.handshake.query?.token;
    if (token === process.env.ADMIN_TOKEN) return next();
    next(new Error("Unauthorized"));
});

// Socket.IO connection handler
io.on("connection", (socket) => {
    console.log("⚡ Dashboard connected");
    socket.emit("whatsapp:ready", ready);
    if (lastQR) socket.emit("whatsapp:qr", lastQR);
});

// Routes
app.get("/", (req, res) => {
    res.json({ status: "Server is running" });
});

app.get("/api/status", requireAdmin, (req, res) => {
    res.json({ ready });
});

app.post("/api/connect", requireAdmin, (req, res) => {
    client.initialize();
    res.json({ ok: true });
});

app.get("/api/qr", requireAdmin, (req, res) => {
    res.json({ qr: lastQR });
});

// Start server
const PORT = process.env.PORT || 8081;

// Initialize WhatsApp client
client.initialize();

// Start server
server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
