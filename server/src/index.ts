import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import webpush from "web-push";
import http from "http";
import { Server } from "socket.io";

import {
  PORT,
  ALLOWED_ORIGINS,
  VAPID_PUBLIC_KEY,
  VAPID_PRIVATE_KEY,
} from "./constants";
import apiRoutes from "./routes";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api", apiRoutes);

// Create an HTTP server from the Express app
const server = http.createServer(app);

// Setup CORS for Socket.IO
export const io = new Server(server, {
  cors: {
    origin: ALLOWED_ORIGINS,
    methods: ["GET", "POST"],
  },
});

// Handle Socket.IO connections
io.on("connection", (socket) => {
  console.log("A client connected to the Socket.IO server.");
  socket.on("disconnect", () => {
    console.log("A client disconnected.");
  });
});

webpush.setVapidDetails(
  "mailto:example@yourdomain.com",
  VAPID_PUBLIC_KEY,
  VAPID_PRIVATE_KEY
);

// Start the server
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
