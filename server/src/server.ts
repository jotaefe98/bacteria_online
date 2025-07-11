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

const app = express();
app.use(cors());

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

  // Start periodic analytics reports
  startPeriodicReports();
});
