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
  rebuildDeck,
  applyTreatmentEffect,
} from "../functions/gameLogic";

// Helper function to get treatment name in English
function getTreatmentName(treatmentColor: string): string {
  switch (treatmentColor) {
    case "transplant":
      return "Transplant";
    case "organ_thief":
      return "Organ Thief";
    case "contagion":
      return "Contagion";
    case "latex_glove":
      return "Latex Glove";
    case "medical_error":
      return "Medical Error";
    default:
      return "Unknown Treatment";
  }
}

// Añade esto al tipo Room:
interface GameRoom extends Room {
  deck?: Card[];
  hands?: { [playerId: string]: Card[] };
  boards?: { [playerId: string]: PlayerBoard };
  currentTurn?: string;
  currentPhase?: GamePhase;
  discardPile?: Card[];
  winner?: string;
  playerNames?: { [playerId: string]: string };
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
    if (room && room.currentTurn === playerId && room.currentPhase === "draw") {
      // Robar cartas hasta tener 3 en la mano
      while (room.hands![playerId].length < 3) {
        // Check if deck is empty
        if (!room.deck || room.deck.length === 0) {
          console.log("Deck is empty, rebuilding deck...");

          // Rebuild deck from base deck excluding cards in use
          const newDeck = rebuildDeck(
            BASE_DECK,
            room.hands!,
            room.boards!,
            room.discardPile!
          );

          // Shuffle the new deck
          room.deck = shuffle(newDeck);

          console.log(`Deck rebuilt with ${room.deck.length} cards`);

          // Notify players that deck was rebuilt
          io.to(roomId).emit("deck-rebuilt", {
            deckSize: room.deck.length,
          });

          // If still no cards available, break
          if (room.deck.length === 0) {
            console.log("No more cards available to rebuild deck");
            break;
          }
        }

        const card = room.deck.shift();
        if (card) {
          room.hands![playerId].push(card);
        } else {
          break; // No more cards available
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
        let result;
        if (card.type === "treatment") {
          // For treatments, use the special function with all context
          result = applyTreatmentEffect(card, room.boards!, playerId, action);
        } else {
          result = applyCardEffect(
            card,
            playerBoard,
            targetBoard,
            action.targetOrganColor,
            room.boards!
          );
        }
        if (!result.success) {
          socket.emit("game-error", result.reason);
          return;
        }

        // Handle special treatment effects and global notifications
        if (result.success && card.type === "treatment") {
          const currentPlayerName = room.playerNames?.[playerId] || playerId;

          // Global notification for treatment usage
          io.to(roomId).emit("treatment-used", {
            byPlayer: currentPlayerName,
            treatmentName: getTreatmentName(card.color),
            treatmentColor: card.color,
          });

          switch (card.color) {
            case "latex_glove":
              // All players except current discard their hands
              Object.keys(room.hands!).forEach((pId) => {
                if (pId !== playerId) {
                  room.discardPile!.push(...room.hands![pId]);
                  room.hands![pId] = [];

                  // Notify affected player
                  io.to(pId).emit("hand-discarded", {
                    byPlayer: currentPlayerName,
                    reason: "latex_glove",
                  });
                }
              });
              break;

            case "contagion":
              // Notify affected players from contagion results
              if (result.changes?.contagionResults) {
                result.changes.contagionResults.forEach((contagion: any) => {
                  io.to(contagion.targetPlayer).emit("organ-infected", {
                    organColor: contagion.organColor,
                    byPlayer: currentPlayerName,
                    cardType: contagion.virusType,
                    reason: "contagion",
                  });
                });
              }
              break;

            case "organ_thief":
              io.to(action.targetPlayerId!).emit("organ-stolen", {
                byPlayer: currentPlayerName,
                organColor: action.targetOrganColor,
              });
              break;

            case "transplant":
              // Notify both players about the transplant
              io.to(action.targetPlayerId!).emit("organ-transplanted", {
                byPlayer: currentPlayerName,
                organGiven: action.targetOrganColor,
                organReceived: action.secondTargetOrganColor,
                otherPlayer:
                  room.playerNames?.[action.secondTargetPlayerId!] ||
                  action.secondTargetPlayerId!,
              });
              io.to(action.secondTargetPlayerId!).emit("organ-transplanted", {
                byPlayer: currentPlayerName,
                organGiven: action.secondTargetOrganColor,
                organReceived: action.targetOrganColor,
                otherPlayer:
                  room.playerNames?.[action.targetPlayerId!] ||
                  action.targetPlayerId!,
              });
              break;

            case "medical_error":
              const targetPlayerId =
                action.targetPlayerId ||
                Object.keys(room.boards!).find(
                  (id) =>
                    id !== playerId &&
                    room.boards![id].organs[action.targetOrganColor!]
                );
              if (targetPlayerId) {
                io.to(targetPlayerId).emit("medical-error-used", {
                  byPlayer: currentPlayerName,
                });
              }
              break;
          }
        }

        // Remover la carta de la mano
        room.hands![playerId].splice(cardIndex, 1);

        // Emitir eventos específicos para notificaciones de acciones directas
        if (result.success && result.changes) {
          const currentPlayerName = room.playerNames?.[playerId] || playerId;

          // Handle virus and medicine actions against other players
          if (action.targetPlayerId && action.targetPlayerId !== playerId) {
            switch (result.changes.type) {
              case "virus_played":
                // Check if organ was destroyed or infected
                const targetOrganAfter =
                  room.boards![action.targetPlayerId].organs[
                    action.targetOrganColor!
                  ];

                if (result.changes.organDestroyed || !targetOrganAfter) {
                  // Organ was destroyed
                  io.to(action.targetPlayerId).emit("organ-destroyed", {
                    organColor: action.targetOrganColor,
                    byPlayer: currentPlayerName,
                    cardType: card.color,
                  });
                } else if (result.changes.vaccineDestroyed) {
                  // Vaccine was destroyed but organ survived
                  io.to(action.targetPlayerId).emit("vaccine-destroyed", {
                    organColor: action.targetOrganColor,
                    byPlayer: currentPlayerName,
                    cardType: card.color,
                  });
                } else {
                  // Organ was infected
                  io.to(action.targetPlayerId).emit("organ-infected", {
                    organColor: action.targetOrganColor,
                    byPlayer: currentPlayerName,
                    cardType: card.color,
                  });
                }
                break;

              case "medicine_played":
                // Only notify target player if medicine was beneficial
                const organStatus =
                  room.boards![action.targetPlayerId].organs[
                    action.targetOrganColor!
                  ]?.status;

                if (organStatus === "healthy" || organStatus === "immunized") {
                  // Medicine cured or immunized the organ
                  io.to(action.targetPlayerId).emit("organ-treated", {
                    organColor: action.targetOrganColor,
                    byPlayer: currentPlayerName,
                    cardType: card.color,
                    treatmentType: organStatus,
                  });
                } else if (organStatus === "vaccinated") {
                  // Medicine was applied as vaccine
                  io.to(action.targetPlayerId).emit("organ-vaccinated", {
                    organColor: action.targetOrganColor,
                    byPlayer: currentPlayerName,
                    cardType: card.color,
                  });
                }
                break;
            }
          }
        }

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
      const nextPlayerId = room.players[nextIndex].playerId;
      room.currentTurn = nextPlayerId;

      // Check if next player has no cards (due to latex glove)
      if (room.hands![nextPlayerId].length === 0) {
        // They start in draw phase instead of play_or_discard
        room.currentPhase = "draw";
      } else {
        room.currentPhase = "play_or_discard";
      }

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
