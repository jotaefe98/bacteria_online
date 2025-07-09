import { Server, Socket } from "socket.io";
import { Card, Room } from "../types/interfaces";
import { BASE_DECK, MIN_NUM_PLAYERS } from "../const/const";

// Añade esto al tipo Room:
interface GameRoom extends Room {
  deck?: Card[];
  hands?: { [playerId: string]: Card[] };
  currentTurn?: string;
}

export function registerGameEvents(
  io: Server,
  socket: Socket,
  rooms: Record<string, Room>
) {
  socket.on("start-game", (roomId: string) => {
    const room = rooms[roomId] as GameRoom;
    if (room && room.players?.length >= MIN_NUM_PLAYERS) {
      console.log(`Game started in room ${roomId}`);
      io.to(roomId).emit("game-started", true);
    } else {
      console.log(
        `Cannot start game in room ${roomId}. Not enough players or room does not exist.`
      );
      socket.emit("game-started", false, "not enough players");
    }
  });

  socket.on("shuffle-deck", (roomId: string) => {
    const room = rooms[roomId] as GameRoom;
    if (room && !room.has_started) {
      // Shuffle the deck
      const deck = [...BASE_DECK].sort(() => Math.random() - 0.5);
      room.deck = deck;
      room.hands = {};
      // Deal cards to players
      for (const player of room.players) {
        room.hands[player.playerId] = room.deck.splice(0, 3);
      }
      room.has_started = true;
      room.currentTurn = room.players[0].playerId;
      io.to(roomId).emit("deck-shuffled", {
        hands: room.hands,
        currentTurn: room.currentTurn,
        playerIdList: room.players.map((p) => p.playerId),
      });
    }
  });

  socket.on("draw-card", (roomId: string, playerId: string) => {
    const room = rooms[roomId] as GameRoom;
    if (
      room &&
      room.currentTurn === playerId &&
      room.deck &&
      room.deck.length > 0
    ) {
      const card = room.deck.shift();
      if (card) {
        room.hands![playerId].push(card);
        io.to(roomId).emit("update-game", {
          hands: room.hands,
          currentTurn: room.currentTurn,
        });
      }
    }
  });

  socket.on(
    "discard-card",
    (roomId: string, playerId: string, cardId: string) => {
      const room = rooms[roomId] as GameRoom;
      if (room && room.currentTurn === playerId) {
        room.hands![playerId] = room.hands![playerId].filter(
          (c) => c.id !== cardId
        );
        // Pasar turno al siguiente jugador
        const idx = room.players.findIndex((p) => p.playerId === playerId);
        const nextIdx = (idx + 1) % room.players.length;
        room.currentTurn = room.players[nextIdx].playerId;
        io.to(roomId).emit("update-game", {
          hands: room.hands,
          currentTurn: room.currentTurn,
        });
      }
    }
  );
}
