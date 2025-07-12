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
import { logger } from "./utils/logger";

console.log("🚀 Server starting...");
console.log(`📁 Node Environment: ${process.env.NODE_ENV || "not set"}`);
console.log(
  `🔗 MongoDB URI: ${
    process.env.MONGODB_URI ? "Set" : "Not set (using default)"
  }`
);
console.log(`🌐 Port: ${process.env.PORT || 3000}`);
console.log(`⏰ Timestamp: ${new Date().toISOString()}`);

const app = express();
app.use(cors());

// Initialize database connection (non-blocking)
let dbStatus = "connecting";
console.log("📊 Initializing database connection...");

// Check database status
setTimeout(() => {
  try {
    console.log("🔄 Checking database status...");

    const connected = databaseManager.isConnected();
    const disabled = databaseManager.isDisabled();

    console.log(
      `📊 Database check results: connected=${connected}, disabled=${disabled}`
    );

    if (disabled) {
      dbStatus = "disabled";
      console.log("⚠️  Analytics system disabled (MongoDB unavailable)");
    } else if (connected) {
      dbStatus = "connected";
      console.log("✅ Analytics system initialized with MongoDB persistence");
    } else {
      dbStatus = "disconnected";
      console.log(
        "⏳ Analytics system running in memory mode (MongoDB connecting...)"
      );
    }

    console.log(`📊 Final database status: ${dbStatus}`);
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    console.log(`❌ Error checking database status: ${errorMessage}`);
    dbStatus = "error";
  }
}, 2000); // Give MongoDB 2 seconds to connect

// Health check endpoint for Render
app.get("/", (req, res) => {
  try {
    console.log("🏥 Health check endpoint accessed");

    const response = {
      status: "OK",
      message: "Bacteria Online Server is running!",
      timestamp: new Date().toISOString(),
      analytics: `MongoDB ${dbStatus}`,
      environment: process.env.NODE_ENV || "not set",
      port: process.env.PORT || 3000,
    };

    console.log(`🏥 Health check response: ${JSON.stringify(response)}`);
    res.json(response);
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    console.log(`❌ Error in health check: ${errorMessage}`);
    res.status(500).json({
      status: "ERROR",
      message: "Internal server error",
      error: errorMessage,
    });
  }
});

app.get("/health", (req, res) => {
  try {
    console.log("🔍 Detailed health check endpoint accessed");

    const connected = databaseManager.isConnected();
    const disabled = databaseManager.isDisabled();

    console.log(
      `🔍 Health check database status: connected=${connected}, disabled=${disabled}`
    );

    const response = {
      status: "healthy",
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      database: dbStatus,
      databaseDetailed: {
        connected: connected,
        disabled: disabled,
        status: dbStatus,
      },
      memory: process.memoryUsage(),
      environment: process.env.NODE_ENV || "not set",
    };

    console.log(
      `🔍 Detailed health check response: ${JSON.stringify(response)}`
    );
    res.json(response);
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    console.log(`❌ Error in detailed health check: ${errorMessage}`);
    res.status(500).json({
      status: "unhealthy",
      error: errorMessage,
      timestamp: new Date().toISOString(),
    });
  }
});

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

const rooms: Record<string, Room> = {};

io.on("connection", (socket) => {
  console.log("🔌 A user connected:", socket.id);
  try {
    registerRoomEvents(io, socket, rooms);
    registerGameEvents(io, socket, rooms);
    console.log("✅ Socket events registered successfully for:", socket.id);
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    console.log(
      `❌ Error registering socket events for ${socket.id}: ${errorMessage}`
    );
  }

  socket.on("disconnect", () => {
    console.log("🔌 User disconnected:", socket.id);
  });
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`⏰ Server started at: ${new Date().toISOString()}`);
  console.log("📊 Analytics system initialized with MongoDB persistence");

  // Start periodic analytics reports (only if MongoDB is connected)
  try {
    if (databaseManager.isConnected()) {
      console.log("📊 Starting periodic analytics reports...");
      startPeriodicReports();
      console.log("✅ Periodic analytics reports started");
    } else {
      console.log(
        "⚠️ MongoDB not connected, skipping periodic analytics reports"
      );
    }
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    console.log(
      `❌ Error starting periodic analytics reports: ${errorMessage}`
    );
  }

  // Check database connection every 30 seconds and update status
  setInterval(() => {
    try {
      console.log("🔄 Checking database connection status...");

      const connected = databaseManager.isConnected();
      const disabled = databaseManager.isDisabled();

      console.log(
        `📊 Database status check: connected=${connected}, disabled=${disabled}, current=${dbStatus}`
      );

      let newStatus = "disconnected";
      if (disabled) {
        newStatus = "disabled";
      } else if (connected) {
        newStatus = "connected";
      }

      if (newStatus !== dbStatus) {
        console.log(`📊 Database status changed: ${dbStatus} → ${newStatus}`);
        dbStatus = newStatus;

        // Start analytics if connection is restored
        if (connected && !disabled) {
          console.log("📊 Connection restored, starting analytics...");
          try {
            startPeriodicReports();
            console.log("✅ Analytics started successfully");
          } catch (error) {
            const errorMessage =
              error instanceof Error ? error.message : "Unknown error";
            console.log(
              `❌ Error starting analytics after reconnection: ${errorMessage}`
            );
          }
        }
      } else {
        console.log(`📊 Database status unchanged: ${dbStatus}`);
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      console.log(
        `❌ Error in database status check interval: ${errorMessage}`
      );
    }
  }, 30000);
});
