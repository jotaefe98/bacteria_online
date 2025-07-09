import { Server, Socket } from "socket.io";
import {
  Card,
  Room,
  PlayerBoard,
  OrganState,
  GamePhase,
  PlayCardAction,
} from "../types/interfaces";
import { BASE_DECK, MIN_NUM_PLAYERS } from "../const/const";
import { shuffle } from "../functions/shuffle";
import {
  canPlayCard,
  applyCardEffect,
  checkWinCondition,
  getPlayableCards,
} from "../functions/gameLogic";

// Añade esto al tipo Room:
interface GameRoom extends Room {
  deck?: Card[];
  hands?: { [playerId: string]: Card[] };
  boards?: { [playerId: string]: PlayerBoard };
  currentTurn?: string;
  currentPhase?: GamePhase;
  discardPile?: Card[];
  winner?: string;
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
      const deck = shuffle(BASE_DECK);
      room.deck = deck;
      room.hands = {};
      room.boards = {};
      room.discardPile = [];

      // Deal cards to players
      for (const player of room.players) {
        room.hands[player.playerId] = room.deck.splice(0, 3);
        room.boards[player.playerId] = { organs: {} };
      }

      room.has_started = true;
      room.currentTurn = room.players[0].playerId;
      room.currentPhase = "play_or_discard";

      console.log("deck: ", JSON.stringify(room.deck));
      io.to(roomId).emit("deck-shuffled", {
        hands: room.hands,
        boards: room.boards,
        currentTurn: room.currentTurn,
        currentPhase: room.currentPhase,
        playerIdList: room.players.map((p) => p.playerId),
        discardPile: room.discardPile,
        playerNames: room.players.reduce((acc, player) => {
          acc[player.playerId] = player.nickname || player.playerId;
          return acc;
        }, {} as { [playerId: string]: string }),
      });
    }
  });

  socket.on("draw-card", (roomId: string, playerId: string) => {
    const room = rooms[roomId] as GameRoom;
    if (
      room &&
      room.currentTurn === playerId &&
      room.currentPhase === "draw" &&
      room.deck &&
      room.deck.length > 0
    ) {
      // Robar cartas hasta tener 3 en la mano
      while (room.hands![playerId].length < 3 && room.deck.length > 0) {
        const card = room.deck.shift();
        if (card) {
          room.hands![playerId].push(card);
        }
      }

      // Cambiar a fase de pasar turno
      room.currentPhase = "end_turn";

      io.to(roomId).emit("update-game", {
        hands: room.hands,
        boards: room.boards,
        currentTurn: room.currentTurn,
        currentPhase: room.currentPhase,
        discardPile: room.discardPile,
      });
    }
  });

  socket.on(
    "discard-card",
    (roomId: string, playerId: string, cardId: string) => {
      const room = rooms[roomId] as GameRoom;
      if (
        room &&
        room.currentTurn === playerId &&
        room.currentPhase === "play_or_discard"
      ) {
        const cardIndex = room.hands![playerId].findIndex(
          (c) => c.id === cardId
        );
        if (cardIndex !== -1) {
          const discardedCard = room.hands![playerId].splice(cardIndex, 1)[0];
          room.discardPile!.push(discardedCard);

          // Cambiar a fase de robar
          room.currentPhase = "draw";

          io.to(roomId).emit("update-game", {
            hands: room.hands,
            boards: room.boards,
            currentTurn: room.currentTurn,
            currentPhase: room.currentPhase,
            discardPile: room.discardPile,
          });
        }
      }
    }
  );

  socket.on(
    "play-card",
    (roomId: string, playerId: string, action: PlayCardAction) => {
      const room = rooms[roomId] as GameRoom;
      if (
        room &&
        room.currentTurn === playerId &&
        room.currentPhase === "play_or_discard"
      ) {
        const cardIndex = room.hands![playerId].findIndex(
          (c) => c.id === action.cardId
        );
        if (cardIndex === -1) return;

        const card = room.hands![playerId][cardIndex];
        const playerBoard = room.boards![playerId];
        const targetBoard = action.targetPlayerId
          ? room.boards![action.targetPlayerId]
          : undefined;

        // Verificar si se puede jugar la carta
        const canPlay = canPlayCard(
          card,
          playerBoard,
          targetBoard,
          action.targetOrganColor
        );
        if (!canPlay.canPlay) {
          socket.emit("game-error", canPlay.reason);
          return;
        }

        // Aplicar el efecto de la carta
        const result = applyCardEffect(
          card,
          playerBoard,
          targetBoard,
          action.targetOrganColor,
          room.boards!
        );
        if (!result.success) {
          socket.emit("game-error", result.reason);
          return;
        }

        // Remover la carta de la mano
        room.hands![playerId].splice(cardIndex, 1);

        // Verificar condición de victoria
        if (checkWinCondition(playerBoard)) {
          room.winner = playerId;
          io.to(roomId).emit("game-won", { winner: playerId });
          return;
        }

        // Cambiar a fase de robar
        room.currentPhase = "draw";

        io.to(roomId).emit("update-game", {
          hands: room.hands,
          boards: room.boards,
          currentTurn: room.currentTurn,
          currentPhase: room.currentPhase,
          discardPile: room.discardPile,
        });
      }
    }
  );

  socket.on("end-turn", (roomId: string, playerId: string) => {
    const room = rooms[roomId] as GameRoom;
    if (
      room &&
      room.currentTurn === playerId &&
      room.currentPhase === "end_turn"
    ) {
      // Pasar turno al siguiente jugador
      const currentIndex = room.players.findIndex(
        (p) => p.playerId === playerId
      );
      const nextIndex = (currentIndex + 1) % room.players.length;
      room.currentTurn = room.players[nextIndex].playerId;
      room.currentPhase = "play_or_discard";

      io.to(roomId).emit("update-game", {
        hands: room.hands,
        boards: room.boards,
        currentTurn: room.currentTurn,
        currentPhase: room.currentPhase,
        discardPile: room.discardPile,
      });
    }
  });

  socket.on(
    "discard-cards",
    (roomId: string, playerId: string, cardIds: string[]) => {
      const room = rooms[roomId] as GameRoom;
      if (
        room &&
        room.currentTurn === playerId &&
        room.currentPhase === "play_or_discard"
      ) {
        // Descartar múltiples cartas
        const discardedCards: Card[] = [];
        cardIds.forEach((cardId) => {
          const cardIndex = room.hands![playerId].findIndex(
            (c) => c.id === cardId
          );
          if (cardIndex !== -1) {
            discardedCards.push(room.hands![playerId].splice(cardIndex, 1)[0]);
          }
        });

        room.discardPile!.push(...discardedCards);
        room.currentPhase = "draw";

        io.to(roomId).emit("update-game", {
          hands: room.hands,
          boards: room.boards,
          currentTurn: room.currentTurn,
          currentPhase: room.currentPhase,
          discardPile: room.discardPile,
        });
      }
    }
  );

  socket.on("request-game-state", (roomId: string) => {
    const room = rooms[roomId] as GameRoom;
    console.log(`Player ${socket.id} requesting game state for room ${roomId}`);
    console.log(`Room exists: ${!!room}, has_started: ${room?.has_started}`);
    console.log(
      `Room hands: ${room?.hands ? Object.keys(room.hands).length : 0} players`
    );

    if (room && room.has_started) {
      console.log(
        `Sending game state to player ${socket.id} in room ${roomId}`
      );
      socket.emit("deck-shuffled", {
        hands: room.hands,
        boards: room.boards,
        currentTurn: room.currentTurn,
        currentPhase: room.currentPhase,
        playerIdList: room.players.map((p) => p.playerId),
        discardPile: room.discardPile,
        playerNames: room.players.reduce((acc, player) => {
          acc[player.playerId] = player.nickname || player.playerId;
          return acc;
        }, {} as { [playerId: string]: string }),
      });
    } else {
      console.log(`Cannot send game state - room not started or doesn't exist`);
    }
  });
}
