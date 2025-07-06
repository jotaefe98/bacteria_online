import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import {
  Room,
} from "./types/interfaces";
import { registerRoomEvents } from "./events/registerRoomEvents";

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
});

server.listen(3000, () => {
  console.log("Server is running on port 3000");
});
