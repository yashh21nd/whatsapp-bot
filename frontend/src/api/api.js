import axios from "axios";
import { io } from "socket.io-client";

const API_URL = "http://localhost:8081";

// Create axios instance
export const api = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
});

// Initialize Socket.IO
export const socket = io(API_URL, {
  auth: {
    token: import.meta.env.VITE_ADMIN_TOKEN || localStorage.getItem("admin_token")
  }
});

// Socket connection status handler
socket.on("connect_error", (error) => {
  console.error("Socket connection error:", error.message);
});

// WhatsApp connection
export const initiateWhatsAppConnection = async () => {
  try {
    await api.post("/api/connect");
    return true;
  } catch (error) {
    console.error("Failed to initiate WhatsApp connection:", error);
    return false;
  }
};

// API calls
export const sendMessage = async (to, body) => {
  const response = await api.post("/api/bot/send", { to, body });
  return response.data;
};

export const fetchRules = async () => {
  const response = await api.get("/api/rules");
  return response.data;
};
