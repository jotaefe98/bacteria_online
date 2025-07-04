import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import {
  DataJoinRoom,
  DataUpdateNickname,
  Player,
  Room,
} from "./types/interfaces";

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

  socket.on("join-room", (data: DataJoinRoom) => {
    console.log("Data recieved in join-room: ", data);
    const { roomId, playerId, nickname } = data;

    socket.join(roomId);

    // If room does not exist, create it
    if (!rooms[roomId]) rooms[roomId] = { players: [], has_started: false };

    const existingPlayer = rooms[roomId].players.find(
      (p) => p.playerId === playerId
    );

    if (existingPlayer) {
      io.to(existingPlayer.socketId).emit("force-disconnect");
      existingPlayer.socketId = socket.id;
    } else {
      const isFirstPlayer = rooms[roomId].players.length === 0;
      rooms[roomId].players.push({
        playerId,
        nickname,
        socketId: socket.id,
        isHost: isFirstPlayer,
      });
    }

    playersUpdate(roomId);

    console.log(`Player ${nickname} joined room ${roomId}`);
  });

  socket.on("update-nickname", (data: DataUpdateNickname) => {
    const { roomId, nickname } = data;

    // Find the player in the room
    const player = rooms[roomId]?.players.find((p) => p.socketId === socket.id);

    if (player) {
      player.nickname = nickname;
      console.log(`Player ${player.playerId} updated nickname to ${nickname}`);
      playersUpdate(roomId);
    } else {
      console.error(`Player not found in room ${roomId}`);
    }
  });

  socket.on("disconnect", () => {
    for (const roomId in rooms) {
      const before = rooms[roomId].players.length;

      // Check if the player who left was the host
      const wasHost = rooms[roomId].players.find(
        (p) => p.socketId === socket.id
      )?.isHost;

      rooms[roomId].players = rooms[roomId].players.filter(
        (p) => p.socketId !== socket.id
      );

      const playersLength = rooms[roomId].players.length;

      // If the player who left was the host, assign host to the first player in the array
      if (wasHost && rooms[roomId].players.length > 0) {
        rooms[roomId].players[0].isHost = true;
      }

      if (playersLength !== before) {
        playersUpdate(roomId);
      }

      if (playersLength === 0) {
        delete rooms[roomId];
      }
    }
    console.log("A user disconnected:", socket.id);
    console.log("room", rooms);
  });
});

server.listen(3000, () => {
  console.log("Server is running on port 3000");
});

/**
 * Emits an updated list of player nicknames to all clients in the specified room.
 *
 * @param roomId The ID of the room whose player list should be updated.
 */
function playersUpdate(roomId: string) {
  const players = rooms[roomId].players.map((p) => ({
    nickname: p.nickname,
    isHost: !!p.isHost,
    playerId: p.playerId,
  }));
  io.to(roomId).emit("players-update", players);
}
