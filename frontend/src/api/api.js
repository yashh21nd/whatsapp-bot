import axios from "axios";
import { io } from "socket.io-client";

const API_URL = import.meta.env.VITE_API_URL || "https://whatsapp-bot-2-1n38.onrender.com";

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
  withCredentials: true
});

// Socket.IO instance
console.log("Initializing Socket.IO connection to:", API_URL);
const socket = io(API_URL, {
  transports: ['websocket', 'polling'],
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  timeout: 20000,
  autoConnect: true
});

// Log socket configuration
console.log("Socket.IO configuration:", {
  url: socket.io.uri,
  transports: socket.io.opts.transports,
  timeout: socket.io.opts.timeout,
  autoConnect: socket.io.opts.autoConnect
});

// Socket connection handlers
let isSocketReconnecting = false;

socket.on("connect", () => {
  console.log("Socket connected");
  isSocketReconnecting = false;
});

socket.on("connect_error", (error) => {
  console.error("Socket connection error:", error.message);
  if (!isSocketReconnecting) {
    isSocketReconnecting = true;
    socket.connect(); // Try to reconnect once
  }
});

socket.on("error", (error) => {
  console.error("Socket error:", error);
});

// Export API functions
export const initiateWhatsAppConnection = async () => {
  console.log("Initiating WhatsApp connection, API URL:", API_URL);
  try {
    const response = await api.post("/api/connect");
    console.log("WhatsApp connection response:", response.data);
    return response.data;
  } catch (error) {
    console.error("WhatsApp connection error:", error.response?.data || error.message);
    throw new Error("Failed to connect to WhatsApp");
  }
};

export { api, socket };

// WhatsApp connection

// API calls
export const sendMessage = async (to, body) => {
  const response = await api.post("/api/bot/send", { to, body });
  return response.data;
};

export const fetchRules = async () => {
  const response = await api.get("/api/rules");
  return response.data;
};
