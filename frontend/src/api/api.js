import axios from "axios";

const API_URL = "http://localhost:8081";

export const api = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
});

// Example API calls
export const sendMessage = async (message) => {
  const response = await api.post("/message", { message });
  return response.data;
};

export const loginWithQR = async (qrCode) => {
  const response = await api.post("/login", { qrCode });
  return response.data;
};

export const fetchRules = async () => {
  const response = await api.get("/rules");
  return response.data;
};
