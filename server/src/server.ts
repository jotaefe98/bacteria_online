import dotenv from "dotenv";
dotenv.config();

import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import { Room } from "./types/interfaces";
import { registerRoomEvents } from "./events/registerRoomEvents";
import { registerGameEvents } from "./events/registerGameEvents";
import { startPeriodicReports } from "./utils/analyticsDashboard";
import { databaseManager } from "./config/database";

const app = express();
app.use(cors());

// Initialize database connection (non-blocking)
let dbStatus = "connecting";

// Check database status
setTimeout(() => {
  const connected = databaseManager.isConnected();
  dbStatus = connected ? "connected" : "disconnected";
  if (connected) {
    console.log("Analytics system initialized with MongoDB persistence");
  } else {
    console.log(
      "Analytics system running in memory mode (MongoDB unavailable)"
    );
  }
}, 2000); // Give MongoDB 2 seconds to connect

// Health check endpoint for Render
app.get("/", (req, res) => {
  res.json({
    status: "OK",
    message: "Bacteria Online Server is running!",
    timestamp: new Date().toISOString(),
    analytics: `MongoDB ${dbStatus}`,
  });
});

app.get("/health", (req, res) => {
  res.json({
    status: "healthy",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    database: dbStatus,
  });
});

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

const rooms: Record<string, Room> = {};

io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);
  registerRoomEvents(io, socket, rooms);
  registerGameEvents(io, socket, rooms);
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log("Analytics system initialized with MongoDB persistence");

  // Start periodic analytics reports (only if MongoDB is connected)
  if (databaseManager.isConnected()) {
    startPeriodicReports();
  }

  // Check database connection every 30 seconds and update status
  setInterval(() => {
    const connected = databaseManager.isConnected();
    const newStatus = connected ? "connected" : "disconnected";
    if (newStatus !== dbStatus) {
      dbStatus = newStatus;
      console.log(`Database status changed: ${dbStatus}`);

      // Start analytics if connection is restored
      if (connected) {
        startPeriodicReports();
      }
    }
  }, 30000);
});
