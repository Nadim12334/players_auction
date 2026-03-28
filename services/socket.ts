import { io } from "socket.io-client";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export const socket = io(BACKEND_URL, {
  autoConnect: true,
});

socket.on("connect", () => {
  console.log("Connected to backend via Socket.IO");
});

socket.on("disconnect", () => {
  console.log("Disconnected from Socket.IO");
});
