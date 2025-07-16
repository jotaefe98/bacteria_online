import { Server, Socket } from "socket.io";
import { DataJoinRoom, DataUpdateNickname, Room } from "../types/interfaces";
import { MAX_NUM_PLAYERS, MIN_NUM_PLAYERS } from "../const/const";
import { safeStringify, logger } from "../utils/logger";

export function registerRoomEvents(
  io: Server,
  socket: Socket,
  rooms: Record<string, Room>
) {
  socket.on("join-room", (data: DataJoinRoom) => {
    try {
      logger.log("🔌 join-room event received");
      logger.log("📊 Data received in join-room: " + safeStringify(data));

      const { roomId, playerId, nickname } = data;

      if (!roomId || !playerId || !nickname) {
        logger.error("❌ Invalid join-room data - missing required fields");
        socket.emit("error", "Invalid room data");
        return;
      }

      logger.log(
        `🏠 Player ${playerId} (${nickname}) attempting to join room ${roomId}`
      );
      socket.join(roomId);

      if (!rooms[roomId]) {
        logger.error(`❌ Room ${roomId} does not exist`);
        socket.emit("error", "Room does not exist");
        return;
      }

      logger.log(
        "🔍 Current rooms state: " + safeStringify(Object.keys(rooms))
      );
      const existingPlayer = rooms[roomId].players.find(
        (p) => p.playerId === playerId
      );

      if (existingPlayer) {
        // Player is reconnecting - update their socket ID and potentially disconnect old connection
        if (existingPlayer.socketId !== socket.id) {
          logger.log(
            `🔄 Player ${playerId} reconnecting - updating socket ID from ${existingPlayer.socketId} to ${socket.id}`
          );
          io.to(existingPlayer.socketId).emit("force-disconnect");
          existingPlayer.socketId = socket.id;

          // Update nickname if provided
          if (nickname) {
            existingPlayer.nickname = nickname;
          }

          // If game has started, send current game state
          const gameRoom = rooms[roomId] as any;
          if (gameRoom.has_started && gameRoom.hands && gameRoom.boards) {
            console.log(
              `Sending game state to reconnecting player ${playerId}`
            );
            setTimeout(() => {
              socket.emit("deck-shuffled", {
                hands: gameRoom.hands,
                boards: gameRoom.boards,
                currentTurn: gameRoom.currentTurn,
                currentPhase: gameRoom.currentPhase,
                playerIdList: gameRoom.players.map((p: any) => p.playerId),
                discardPile: gameRoom.discardPile,
                playerNames: gameRoom.playerNames,
              });
            }, 500);
          }
        }
      } else {
        const isFirstPlayer = rooms[roomId].players.length === 0;
        rooms[roomId].players.push({
          playerId,
          nickname,
          socketId: socket.id,
          isHost: isFirstPlayer,
        });
      }

      // If a user joins in a room, then it is not new anymore
      if (rooms[roomId].new_room) rooms[roomId].new_room = false;

      playersUpdate(roomId);

      const roomSettings = {
        min_players: MIN_NUM_PLAYERS,
        max_players: MAX_NUM_PLAYERS,
      };

      socket.emit("room-settings", roomSettings);

      console.log(`Player ${nickname} joined room ${roomId}`);
      console.log("Current rooms:", rooms);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      const errorStack =
        error instanceof Error ? error.stack : "No stack trace";
      logger.error(`❌ Error in join-room event: ${errorMessage}`);
      logger.error(`🔍 Error stack: ${errorStack}`);
      socket.emit("error", "Internal server error");
    }
  });

  socket.on("update-nickname", (data: DataUpdateNickname) => {
    try {
      logger.log("🔄 update-nickname event received");
      logger.log("📊 Data received: " + safeStringify(data));

      const { roomId, nickname } = data;

      if (!roomId || !nickname) {
        logger.error(
          "❌ Invalid update-nickname data - missing required fields"
        );
        socket.emit("error", "Invalid nickname data");
        return;
      }

      // Find the player in the room
      const player = rooms[roomId]?.players.find(
        (p) => p.socketId === socket.id
      );

      if (player) {
        player.nickname = nickname;
        logger.log(
          `✅ Player ${player.playerId} updated nickname to ${nickname}`
        );
        playersUpdate(roomId);
      } else {
        logger.error(
          `❌ Player not found in room ${roomId} for socket ${socket.id}`
        );
        socket.emit("error", "Player not found");
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      logger.error(`❌ Error in update-nickname event: ${errorMessage}`);
      socket.emit("error", "Internal server error");
    }
  });

  socket.on("create-room", (roomId: string) => {
    try {
      logger.log("🏠 create-room event received");
      logger.log(`📊 Creating room with ID: ${roomId}`);

      if (!roomId) {
        logger.error("❌ Invalid create-room data - missing roomId");
        socket.emit("error", "Invalid room ID");
        return;
      }

      if (!rooms[roomId]) {
        rooms[roomId] = { players: [], has_started: false, new_room: true };
        logger.log(`✅ Room created with ID: ${roomId}`);
      } else {
        logger.log(`⚠️ Room ${roomId} already exists`);
      }

      logger.log("🔍 Current rooms: " + safeStringify(Object.keys(rooms)));
      socket.emit("room-created", roomId);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      logger.error(`❌ Error in create-room event: ${errorMessage}`);
      socket.emit("error", "Internal server error");
    }
  });

  socket.on("existing-room", (roomId: string, playerId: string) => {
    console.log(`Checking if room ${roomId} exists`);
    console.log("Current rooms:", rooms);
    const existingRoom = rooms[roomId];
    const roomIsFull = existingRoom?.players?.length >= MAX_NUM_PLAYERS;
    const roomIsStarted = existingRoom?.has_started;

    const isPlayerInRoom = existingRoom?.players.some(
      (p) => p.playerId === playerId
    );

    // If the player is reconnecting to a game in progress, mark this as a reconnection
    const isReconnecting = roomIsStarted && isPlayerInRoom;

    socket.emit(
      "existing-room",
      !!existingRoom,
      roomId,
      roomIsStarted,
      roomIsFull,
      isPlayerInRoom,
      isReconnecting
    );
  });

  socket.on("leave-room", ({ roomId }: { roomId: string }) => {
    console.log(`Player ${socket.id} is leaving room ${roomId}`);
    handlePlayerLeave(roomId, socket.id);
  });

  // New event for handling browser close/tab close
  socket.on(
    "player-disconnect",
    ({
      roomId,
      playerId,
      reason,
    }: {
      roomId: string;
      playerId: string;
      reason: string;
    }) => {
      console.log(
        `Player ${playerId} disconnected from room ${roomId}, reason: ${reason}`
      );
      handlePlayerLeave(roomId, socket.id);
    }
  );

  // Handle socket disconnect (browser close, network issues, etc.)
  socket.on("disconnect", (reason: string) => {
    console.log(`Socket ${socket.id} disconnected, reason: ${reason}`);

    // Find which room this socket belonged to and remove the player
    Object.keys(rooms).forEach((roomId) => {
      const room = rooms[roomId];
      if (room && room.players.some((p) => p.socketId === socket.id)) {
        console.log(
          `Removing player ${socket.id} from room ${roomId} due to disconnect`
        );
        handlePlayerLeave(roomId, socket.id);
      }
    });
  });

  /**
   * Handles player leaving a room - common logic for leave-room, player-disconnect, and disconnect events
   */
  function handlePlayerLeave(roomId: string, socketId: string) {
    if (!rooms[roomId]?.has_started && rooms[roomId]) {
      console.log("roomId", roomId);
      console.log("rooms", rooms);
      const before = rooms[roomId].players.length;

      // Check if the player who left was the host
      const wasHost = rooms[roomId].players.find(
        (p) => p.socketId === socketId
      )?.isHost;

      rooms[roomId].players = rooms[roomId].players.filter(
        (p) => p.socketId !== socketId
      );

      // If the player who left was the host, assign host to the first player in the array
      if (wasHost && rooms[roomId].players.length > 0) {
        rooms[roomId].players[0].isHost = true;
      }
      const playersLength = rooms[roomId].players.length;
      if (playersLength !== before) {
        playersUpdate(roomId);
      }
    }

    if (
      rooms[roomId] &&
      rooms[roomId].players.length === 0 &&
      !rooms[roomId].new_room
    ) {
      // If the room is empty, it was not a new room, delete it
      delete rooms[roomId];
    }

    console.log("Player removed from room:", socketId);
    console.log("room", safeStringify(rooms, 2));
  }

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
}
