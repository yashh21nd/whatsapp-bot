import axios from "axios";
import { io } from "socket.io-client";

const API_URL = "http://localhost:8081";

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json"
  }
});

// Socket.IO instance
const socket = io(API_URL, {
  transports: ['websocket', 'polling'],
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  timeout: 20000,
  autoConnect: true
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
  try {
    const response = await api.post("/api/connect");
    return response.data;
  } catch (error) {
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
