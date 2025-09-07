import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";
import rateLimit from "express-rate-limit";

import pkg from "whatsapp-web.js";
const { Client, LocalAuth } = pkg;

import QRCode from "qrcode";

import { saveMessage, getMessages } from "./models/messages.js";
import { getRules, addRule, updateRule, deleteRule } from "./models/rules.js";
import { db } from "./db.js"; // initializes DB
import { requireAdmin } from "./auth.js";
import { generateLLMReply } from "./services/llm.js";

dotenv.config();

// --- Express setup ---
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: process.env.DASHBOARD_ORIGIN?.split(",") || "*" },
});

app.use(cors({ origin: process.env.DASHBOARD_ORIGIN?.split(",") || "*" }));
app.use(express.json());
app.use(morgan("dev"));

// --- WhatsApp Client ---
let WAclient;
let lastQR = null;
let ready = false;

function initWA() {
  if (WAclient) return WAclient;

  WAclient = new Client({
    authStrategy: new LocalAuth({ dataPath: process.env.SESSION_DIR || "./sessions" }),
    puppeteer: { headless: true, args: ["--no-sandbox", "--disable-setuid-sandbox"] },
  });

  WAclient.on("qr", async (qr) => {
    lastQR = await QRCode.toDataURL(qr);
    ready = false;
    io.emit("whatsapp:qr", lastQR);
    io.emit("whatsapp:ready", false);
  });

  WAclient.on("ready", () => {
    ready = true;
    io.emit("whatsapp:ready", true);
    console.log("✅ WhatsApp client is ready");
  });

  WAclient.on("message", async (msg) => {
    if (msg.fromMe) return;
    const chatId = msg.from;

    // Save incoming
    await saveMessage(chatId, msg.from, "me", msg.body, "in", "incoming");
    io.emit("message:new", {
      chatId,
      from: msg.from,
      body: msg.body,
      direction: "in",
      at: Date.now(),
    });

    // Apply rules
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
        if (msg.body.toLowerCase().includes(r.pattern.toLowerCase())) {
          matched = r;
          break;
        }
      }
    }

    let replyText = null;
    let source = "rule";

    if (matched) {
      replyText = matched.reply;
    } else {
      // Fallback to LLM
      source = "llm";
      const contextMsgs = await getMessages(chatId, 10);
      const context = contextMsgs
        .reverse()
        .map((m) => `${m.direction === "in" ? "User" : "Bot"}: ${m.body}`)
        .join("\n");
      replyText = await generateLLMReply(context, msg.body);
    }

    if (replyText) {
      await msg.reply(replyText);
      await saveMessage(chatId, "me", msg.from, replyText, "out", source);
      io.emit("reply:sent", {
        chatId,
        to: msg.from,
        body: replyText,
        source,
        at: Date.now(),
      });
    }
  });

  WAclient.initialize();
  return WAclient;
}

// --- Socket.IO auth ---
io.use((socket, next) => {
  const token = socket.handshake.auth?.token || socket.handshake.query?.token;
  if (token === process.env.ADMIN_TOKEN) return next();
  next(new Error("Unauthorized"));
});

io.on("connection", (socket) => {
  console.log("⚡ Dashboard connected");
  socket.emit("whatsapp:ready", ready);
  if (lastQR) socket.emit("whatsapp:qr", lastQR);
});

// --- Routes ---

app.get("/api/status", (req, res) => {
  res.json({ ready });
});

app.post("/api/connect", requireAdmin, (req, res) => {
  initWA();
  res.json({ ok: true });
});

app.get("/api/qr", requireAdmin, (req, res) => {
  res.json({ qr: lastQR });
});

// Messages
app.get("/api/messages", requireAdmin, async (req, res) => {
  const { chatId } = req.query;
  const msgs = await getMessages(chatId);
  res.json(msgs);
});

app.post(
  "/api/bot/send",
  requireAdmin,
  rateLimit({ windowMs: 60_000, max: 20 }),
  async (req, res) => {
    const { to, body } = req.body;
    if (!to || !body) return res.status(400).json({ error: "to and body required" });

    if (!ready) return res.status(409).json({ error: "WhatsApp not ready" });

    try {
      const sendTo = to.includes("@c.us") ? to : `${to}@c.us`;
      await WAclient.sendMessage(sendTo, body);
      await saveMessage(to, "me", to, body, "out", "manual");
      io.emit("reply:sent", { chatId: to, to, body, source: "manual", at: Date.now() });
      res.json({ ok: true });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  }
);

// Rules CRUD
app.get("/api/rules", requireAdmin, async (req, res) => {
  const rules = await getRules();
  res.json(rules);
});

app.post("/api/rules", requireAdmin, async (req, res) => {
  const { name, pattern, isRegex, reply, active } = req.body;
  if (!pattern || !reply) return res.status(400).json({ error: "pattern and reply required" });
  await addRule(name, pattern, isRegex, reply, active);
  res.json({ ok: true });
});

app.put("/api/rules/:id", requireAdmin, async (req, res) => {
  await updateRule(req.params.id, req.body);
  res.json({ ok: true });
});

app.delete("/api/rules/:id", requireAdmin, async (req, res) => {
  await deleteRule(req.params.id);
  res.json({ ok: true });
});

// --- Start server ---
const PORT = process.env.PORT || 8081;
initWA();
server.listen(PORT, () => console.log(`🚀 API running on http://localhost:${PORT}`));
