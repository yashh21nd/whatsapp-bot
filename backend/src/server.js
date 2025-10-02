import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";
import { mkdirSync, existsSync } from 'fs';
import pkg from "whatsapp-web.js";
const { Client } = pkg;
import qrcode from "qrcode-terminal";
import rateLimit from "express-rate-limit";
import { saveMessage, getMessages } from "./models/messages.js";
import { getRules, addRule, updateRule, deleteRule } from "./models/rules.js";
import { generateLLMReply } from "./services/llm.js";

// Custom error handler
class AppError extends Error {
    constructor(statusCode, message) {
        super(message);
        this.statusCode = statusCode;
        this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
        Error.captureStackTrace(this, this.constructor);
    }
}

// Load environment variables
const result = dotenv.config();

if (result.error) {
    console.warn('Warning: .env file not found. Using default values.');
}

// No environment variables required
console.log('Starting server...');

// Express setup
const app = express();
const server = http.createServer(app);
const ioServer = new Server(server, {
    cors: {
        origin: true,
        methods: ['GET', 'POST', 'OPTIONS'],
        credentials: true
    },
    pingTimeout: 60000,
    pingInterval: 25000,
    transports: ['websocket', 'polling']
});

// Socket connection handling
ioServer.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    // Send initial state if WhatsApp is already connected
    if (ready) {
        socket.emit('whatsapp:state', {
            state: 'connected',
            ready: true,
            timestamp: Date.now()
        });
    } else if (lastQR) {
        socket.emit('whatsapp:state', {
            state: 'qr_ready',
            qr: lastQR,
            timestamp: Date.now()
        });
    } else if (isInitializing) {
        socket.emit('whatsapp:state', {
            state: 'initializing',
            timestamp: Date.now()
        });
    }

    socket.on('disconnect', (reason) => {
        console.log('Client disconnected:', socket.id, 'Reason:', reason);
    });

    socket.on('error', (error) => {
        console.error('Socket error:', error);
    });
});

// Rate limiting configuration
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later',
    standardHeaders: true,
    legacyHeaders: false
});

// Error handling middleware
const errorHandler = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    if (process.env.NODE_ENV === 'development') {
        res.status(err.statusCode).json({
            status: err.status,
            error: err,
            message: err.message,
            stack: err.stack
        });
    } else {
        // Production mode: don't leak error details
        res.status(err.statusCode).json({
            status: err.status,
            message: err.message
        });
    }
};

// Request logging middleware with more details
const detailedLogger = morgan((tokens, req, res) => {
    return JSON.stringify({
        method: tokens.method(req, res),
        url: tokens.url(req, res),
        status: tokens.status(req, res),
        responseTime: tokens['response-time'](req, res) + 'ms',
        userAgent: tokens['user-agent'](req, res),
        timestamp: new Date().toISOString()
    });
});

// Middleware setup
app.use(express.json({ limit: '10kb' }));
app.use(morgan('dev'));

// Enhanced CORS configuration
app.use(cors({
    origin: true,
    methods: ['GET', 'POST', 'OPTIONS', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-requested-with', 'Accept', 'Origin'],
    exposedHeaders: ['Content-Range', 'X-Content-Range'],
    credentials: true,
    maxAge: 600,
    preflightContinue: false,
    optionsSuccessStatus: 204
}));

// Handle preflight requests explicitly
app.options('*', (req, res) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    res.sendStatus(204);
});

// Auth and payment routes
import authRoutes from './routes/auth.js';
import paymentRoutes from './routes/payment.js';
app.use('/api/auth', authRoutes);
app.use('/api/payment', paymentRoutes);

// Apply rate limiting to API routes
app.use('/api', apiLimiter);

// Authentication middleware
const auth = (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(" ")[1] || req.query.token;
        if (!token) {
            return res.status(401).json({ error: 'No authentication token provided' });
        }
        if (token !== process.env.ADMIN_TOKEN) {
            return res.status(401).json({ error: 'Invalid authentication token' });
        }
        next();
    } catch (error) {
        console.error('Auth error:', error);
        res.status(401).json({ error: 'Authentication failed' });
    }
};

// --- WhatsApp Client Configuration ---
const CHROMIUM_PATH = process.env.CHROMIUM_PATH; // Optional custom Chromium path
const SESSION_DIR = process.env.SESSION_DIR || './sessions';

// Create sessions directory if it doesn't exist
if (!existsSync(SESSION_DIR)) {
    console.log('Creating sessions directory...');
    mkdirSync(SESSION_DIR, { recursive: true });
}

const SESSION_FILE_PATH = `${SESSION_DIR}/whatsapp-session.json`;
let sessionData = null;
try {
    if (existsSync(SESSION_FILE_PATH)) {
        sessionData = JSON.parse(require('fs').readFileSync(SESSION_FILE_PATH));
        console.log('Loaded WhatsApp session from file.');
    }
} catch (err) {
    console.warn('Failed to load WhatsApp session:', err.message);
}

const client = new Client({
        puppeteer: {
                headless: true,
                args: [
                        '--no-sandbox',
                        '--disable-setuid-sandbox',
                        '--disable-dev-shm-usage',
                        '--disable-accelerated-2d-canvas',
                        '--no-first-run',
                        '--no-zygote',
                        '--disable-gpu',
                        '--disable-software-rasterizer',
                        '--disable-extensions',
                        '--disable-default-apps',
                        '--window-size=1280,720'
                ],
                executablePath: CHROMIUM_PATH,
                timeout: 120000,
                defaultViewport: { width: 1280, height: 720 }
        },
        session: sessionData,
        qrMaxRetries: 3,
        restartOnAuthFail: true,
        takeoverOnConflict: true,
        userAgent: 'WhatsApp/2.2326.10 Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/94.0.4606.81 Safari/537.36'
});

// State management
let lastQR = null;
let ready = false;
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 5;
const RECONNECT_INTERVAL = 5000;
const connectionState = {
    lastError: null,
    lastReconnectAttempt: null,
    clientState: 'disconnected'
};

// Track initialization state
let isInitializing = false;

// WhatsApp client event handlers with improved error handling and state management
client.on('qr', async (qr) => {
    try {
        // Only process QR if we're not already connected
        if (ready) {
            console.log('Ignoring QR code - client is already connected');
            return;
        }

        // Display QR in terminal for debugging
        qrcode.generate(qr, { small: true });
        
        // Save QR code and update state
        lastQR = qr;
        connectionState.clientState = 'awaiting_qr_scan';
        
        // Send QR and state to all connected clients
        ioServer.emit('whatsapp:state', {
            state: 'qr_ready',
            qr: qr,
            ready: false,
            timestamp: Date.now()
        });
        
        console.log('New QR code generated and sent to frontend');
    } catch (error) {
        console.error('Error handling QR code:', error);
        connectionState.lastError = error.message;
        ioServer.emit('whatsapp:error', { 
            error: 'QR code generation failed',
            timestamp: Date.now()
        });
    }
});

client.on('ready', () => {
        console.log('Client is ready!');
        ready = true;
        lastQR = null; // Clear the QR code
        reconnectAttempts = 0;
        isInitializing = false;
        connectionState.clientState = 'connected';
        connectionState.lastError = null;

        // Save session to file for persistence
        client.getSession().then(session => {
            require('fs').writeFileSync(SESSION_FILE_PATH, JSON.stringify(session));
            console.log('WhatsApp session saved to file.');
        }).catch(err => {
            console.warn('Failed to save WhatsApp session:', err.message);
        });

        ioServer.emit('whatsapp:state', {
                state: 'connected',
                ready: true,
                timestamp: Date.now()
        });

        // Initialize message handling
        console.log('Initializing message handlers...');
});

client.on('loading_screen', (percent, message) => {
    console.log('Loading screen:', percent, '%', message);
    connectionState.clientState = 'loading';
    ioServer.emit('whatsapp:state', {
        state: 'loading',
        percent,
        message,
        timestamp: Date.now()
    });
});

client.on('authenticated', () => {
    console.log('Client authenticated');
    connectionState.clientState = 'authenticated';
    ioServer.emit('whatsapp:state', {
        state: 'authenticated',
        timestamp: Date.now()
    });
});

client.on('auth_failure', (error) => {
    console.error('Auth failure:', error);
    connectionState.clientState = 'auth_failed';
    connectionState.lastError = error.message;
    ioServer.emit('whatsapp:state', {
        state: 'auth_failed',
        error: error.message,
        timestamp: Date.now()
    });
});

// Handle client disconnection
client.on('disconnected', async (reason) => {
    console.log('Client was disconnected:', reason);
    ready = false;
    isInitializing = false;
    connectionState.clientState = 'disconnected';

    ioServer.emit('whatsapp:state', {
        state: 'disconnected',
        ready: false,
        reason: reason,
        timestamp: Date.now()
    });

    try {
        // Clean up the existing session
        await client.destroy();
        console.log('Cleaned up existing session');

        // Remove session file to force new QR if needed
        if (existsSync(SESSION_FILE_PATH)) {
          require('fs').unlinkSync(SESSION_FILE_PATH);
          console.log('WhatsApp session file deleted.');
        }

        if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
            reconnectAttempts++;
            console.log(`Attempting to reconnect (${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS})...`);

            // Wait before attempting to reconnect
            await new Promise(resolve => setTimeout(resolve, RECONNECT_INTERVAL * 2));

            // Initialize new connection
            if (!isInitializing && !ready) {
                isInitializing = true;
                await client.initialize();
            }
        } else {
            console.error('Max reconnection attempts reached. Manual restart required.');
            connectionState.lastError = 'Max reconnection attempts reached';
        }
    } catch (error) {
        console.error('Error during reconnection:', error);
        connectionState.lastError = error.message;
    }
});

// Message handling with rate limiting
const messageRateLimit = new Map();
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const MAX_MESSAGES_PER_WINDOW = 30;

client.on('message', async (msg) => {
    if (msg.fromMe) return;
    const chatId = msg.from;
    // Rate limiting check
    const now = Date.now();
    const userMessages = messageRateLimit.get(chatId) || [];
    const recentMessages = userMessages.filter(time => now - time < RATE_LIMIT_WINDOW);
    
    if (recentMessages.length >= MAX_MESSAGES_PER_WINDOW) {
        console.log(`Rate limit exceeded for ${chatId}`);
        return;
    }

    // Update rate limit tracking
    messageRateLimit.set(chatId, [...recentMessages, now]);

    // Save incoming message for dashboard
    await saveMessage(chatId, msg.from, "me", msg.body, "in", "incoming");
    ioServer.emit("message:new", {
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
        return; // Exit after handling commands
    }

    // Handle mathematical expressions
    if (messageText.match(/^[\d\s+\-*/(). ]+$/)) {
        try {
            const result = eval(messageText.replace(/[^0-9+\-*/(). ]/g, ''));
            await msg.reply(`The result is: ${result}`);
            await saveMessage(chatId, "me", msg.from, `The result is: ${result}`, "out", "math");
            ioServer.emit("reply:sent", {
                chatId,
                to: msg.from,
                body: `The result is: ${result}`,
                source: "math",
                at: Date.now(),
            });
            return;
        } catch (error) {
            console.error('Math evaluation error:', error);
        }
    }

    // Check custom rules
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
            } catch (error) {
                console.error('Regex error:', error);
            }
        } else {
            if (messageText.includes(r.pattern.toLowerCase())) {
                matched = r;
                break;
            }
        }
    }

    if (matched) {
        try {
            await msg.reply(matched.reply);
            await saveMessage(chatId, "me", msg.from, matched.reply, "out", "rule");
            ioServer.emit("reply:sent", {
                chatId,
                to: msg.from,
                body: matched.reply,
                source: "rule",
                at: Date.now(),
            });
            return;
        } catch (error) {
            console.error('Error sending rule-based reply:', error);
        }
    }

    // Use LLM for natural conversation
    try {
        const llmReply = await generateLLMReply(msg.body);
        if (llmReply) {
            await msg.reply(llmReply);
            await saveMessage(chatId, "me", msg.from, llmReply, "out", "llm");
            ioServer.emit("reply:sent", {
                chatId,
                to: msg.from,
                body: llmReply,
                source: "llm",
                at: Date.now(),
            });
        }
    } catch (error) {
        console.error('Error generating LLM reply:', error);
        // Send a fallback message if LLM fails
        const fallbackReply = "I'm having trouble processing your message. Please try again later.";
        await msg.reply(fallbackReply);
        await saveMessage(chatId, "me", msg.from, fallbackReply, "out", "fallback");
        ioServer.emit("reply:sent", {
            chatId,
            to: msg.from,
            body: fallbackReply,
            source: "fallback",
            at: Date.now(),
        });
    }
});

// Socket.IO setup without auth
ioServer.use((socket, next) => {
    next();
});

// Socket.IO connection handler
ioServer.on("connection", (socket) => {
    console.log("Dashboard connected");
    
    if (ready) {
        socket.emit("whatsapp:ready", true);
    } else if (lastQR) {
        socket.emit("whatsapp:qr", lastQR);
    }
    
    socket.on('disconnect', () => {
        console.log('Dashboard disconnected');
    });
});

// API Response formatter
const formatResponse = (data, message = 'Success') => ({
    status: 'success',
    message,
    data,
    timestamp: Date.now()
});

// Routes with improved error handling
app.get("/", (req, res) => {
    res.json({ status: "Server is running" });
});

app.get("/api/status", (req, res) => {
    // Ensure CORS headers are set
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    
    res.json(formatResponse({
        ready,
        connectionState,
        memoryUsage: process.memoryUsage(),
        uptime: process.uptime()
    }));
});

app.post("/api/connect", async (req, res, next) => {
    try {
        // Ensure CORS headers are set
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
        
        // Check if already initializing or connected
        if (isInitializing) {
            throw new AppError(400, 'WhatsApp client is already initializing');
        }
        
        if (ready) {
            throw new AppError(400, 'WhatsApp client is already connected');
        }
        
        // Set initialization flag
        isInitializing = true;
        
        // Reset state
        lastQR = null;
        reconnectAttempts = 0;
        connectionState.clientState = 'initializing';
        
        // Destroy existing client if it exists
        try {
            await client.destroy();
            console.log('Destroyed existing client');
        } catch (error) {
            console.log('No existing client to destroy');
        }
        
        // Initialize new client
        console.log('Initializing WhatsApp client...');
        await client.initialize();
        
        res.json(formatResponse({
            status: 'initializing',
            timestamp: Date.now()
        }, 'WhatsApp client initialization started'));
    } catch (error) {
        isInitializing = false;
        next(error);
    }
});

app.get("/api/qr", (req, res, next) => {
    try {
        // Ensure CORS headers are set
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
        
        if (!lastQR) {
            throw new AppError(404, 'No QR code available. Try connecting first.');
        }
        res.json(formatResponse({
            qr: lastQR,
            state: connectionState.clientState,
            generatedAt: Date.now()
        }));
    } catch (error) {
        next(error);
    }
});

// Rules API endpoints
app.get("/api/rules", async (req, res, next) => {
    try {
        // Ensure CORS headers are set
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
        
        const rules = await getRules();
        res.json(formatResponse(rules, 'Rules retrieved successfully'));
    } catch (error) {
        next(error);
    }
});

app.post("/api/rules", async (req, res, next) => {
    try {
        // Ensure CORS headers are set
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
        
        const { name, pattern, isRegex, reply, active } = req.body;
        
        if (!name || !pattern || !reply) {
            throw new AppError(400, 'Name, pattern, and reply are required');
        }
        
        const result = await addRule(name, pattern, isRegex, reply, active);
        res.json(formatResponse({ id: result.lastID }, 'Rule created successfully'));
    } catch (error) {
        next(error);
    }
});

app.put("/api/rules/:id", async (req, res, next) => {
    try {
        // Ensure CORS headers are set
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
        
        const { id } = req.params;
        const updateData = req.body;
        
        await updateRule(id, updateData);
        res.json(formatResponse({ id }, 'Rule updated successfully'));
    } catch (error) {
        next(error);
    }
});

app.delete("/api/rules/:id", async (req, res, next) => {
    try {
        // Ensure CORS headers are set
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
        
        const { id } = req.params;
        
        await deleteRule(id);
        res.json(formatResponse({ id }, 'Rule deleted successfully'));
    } catch (error) {
        next(error);
    }
});

// Add global error handler
app.use(errorHandler);

// Handle unhandled rejections
process.on('unhandledRejection', (err) => {
    console.error('UNHANDLED REJECTION! 💥 Shutting down...');
    console.error(err.name, err.message);
    console.error(err.stack);
    // Give server time to finish pending requests before shutting down
    server.close(() => {
        process.exit(1);
    });
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
    console.error('UNCAUGHT EXCEPTION! 💥 Shutting down...');
    console.error(err.name, err.message);
    console.error(err.stack);
    process.exit(1);
});

// Graceful shutdown handler
const gracefulShutdown = async () => {
    console.log('Received shutdown signal, starting graceful shutdown...');
    
    // Close WhatsApp client if connected
    if (ready) {
        try {
            await client.destroy();
            console.log('WhatsApp client destroyed successfully');
        } catch (error) {
            console.error('Error destroying WhatsApp client:', error);
        }
    }
    
    // Close server
    server.close(() => {
        console.log('Server closed successfully');
        process.exit(0);
    });
    
    // Force close after 10 seconds
    setTimeout(() => {
        console.error('Could not close connections in time, forcefully shutting down');
        process.exit(1);
    }, 10000);
};

// Handle shutdown signals
process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

// Start server
const PORT = process.env.PORT || 8081;

server.listen(PORT, '0.0.0.0', () => {
    console.log(`
    🚀 Server is running!
    🌐 Port:             ${PORT}
    ⚡ Environment:      ${process.env.NODE_ENV || 'development'}
    📝 Logging:         ${process.env.NODE_ENV === 'development' ? 'Detailed' : 'Production'}
    🔐 Admin API:        Protected by token
    🤖 WhatsApp Client:  ${connectionState.clientState}
    `);
});

// Client-side socket connection (for testing)
// const API_URL = process.env.API_URL || 'http://localhost:8081';
// const socket = io(API_URL, {
//     transports: ['websocket', 'polling'],
//     reconnectionAttempts: 5,
//     reconnectionDelay: 1000,
//     withCredentials: true
// });

// socket.on('connect', () => {
//     console.log('Connected to server:', socket.id);
// });

// socket.on('disconnect', (reason) => {
//     console.log('Disconnected from server:', reason);
// });

// socket.on('whatsapp:state', (state) => {
//     console.log('WhatsApp state changed:', state);
// });

// socket.on('whatsapp:error', (error) => {
//     console.error('WhatsApp error:', error);
// });
