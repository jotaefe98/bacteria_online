import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import { DataJoinRoom, Player } from "./types/interfaces";

const app = express();
app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

const rooms: Record<string,Player[]> = {};

io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  socket.on("join-room", (data: DataJoinRoom) => {
    console.log("Data recieved in join-room: ", data);
    const {roomId, playerId, nickname} = data;

    socket.join(roomId);

    // If room does not exist, create it
    if(!rooms[roomId]) rooms[roomId] = [];

    // If there is no player with that id, add the player to the room
    if (!rooms[roomId].some(p => p.playerId === playerId)) {
      rooms[roomId].push({ playerId, nickname,socketId: socket.id });
    }

    const nicknames = rooms[roomId].map(p => p.nickname);
    io.to(roomId).emit("players-update", nicknames);

    console.log(`Player ${nickname} joined room ${roomId}`);
  });

  socket.on("disconnect", () => {
    for (const roomId in rooms) {
      const before = rooms[roomId].length;
      rooms[roomId] = rooms[roomId].filter(p => p.socketId !== socket.id);
      if (rooms[roomId].length !== before) {
        const nicknames = rooms[roomId].map(p => p.nickname);
        io.to(roomId).emit("players-update", nicknames);
      }
      
    }
    console.log("A user disconnected:", socket.id);
    console.log('room',rooms);
  });
});

server.listen(3000, () => {
  console.log("Server is running on port 3000");
});
