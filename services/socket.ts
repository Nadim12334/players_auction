import { io } from "socket.io-client";

const RAW_API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
const BACKEND_URL = RAW_API_URL.endsWith("/api") ? RAW_API_URL.slice(0, -4) : RAW_API_URL;

export const socket = io(BACKEND_URL, {
  autoConnect: true,
});

socket.on("connect", () => {
  console.log("Connected to backend via Socket.IO");
});

socket.on("disconnect", () => {
  console.log("Disconnected from Socket.IO");
});
