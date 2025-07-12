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
import { safeStringify } from "../utils/logger";
import { logger } from "../utils/logger";
import { analyticsManager } from "../utils/analytics";
import { shuffle } from "../functions/shuffle";
import {
  canPlayCard,
  canPlayTreatment,
  applyCardEffect,
  checkWinCondition,
  checkWinConditionForAllPlayers,
  getPlayableCards,
  rebuildDeck,
  applyTreatmentEffect,
  calculateOrganStatus,
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

// Helper function to get player name safely
function getPlayerName(room: GameRoom, playerId: string): string {
  // First try playerNames mapping
  if (room.playerNames && room.playerNames[playerId]) {
    console.log(
      `Found player name in playerNames: ${playerId} -> ${room.playerNames[playerId]}`
    );
    return room.playerNames[playerId];
  }

  // Fallback to players array
  const player = room.players.find((p) => p.playerId === playerId);
  if (player && player.nickname) {
    console.log(
      `Found player name in players array: ${playerId} -> ${player.nickname}`
    );
    return player.nickname;
  }

  // Last resort: return playerId
  console.log(`No player name found, using playerId: ${playerId}`);
  return playerId;
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
  // Timer properties
  turnStartTime?: number;
  turnTimeLimit?: number; // in seconds
  turnTimer?: NodeJS.Timeout;
}

// Timer helper functions
function startTurnTimer(io: Server, roomId: string, room: GameRoom) {
  if (room.turnTimer) {
    clearTimeout(room.turnTimer);
  }

  room.turnStartTime = Date.now();
  room.turnTimeLimit = 90;

  // Log turn start
  const currentPlayerName = getPlayerName(room, room.currentTurn!);
  analyticsManager.logTurnStart(roomId, room.currentTurn!, currentPlayerName);

  room.turnTimer = setTimeout(() => {
    handleTimeOut(io, roomId, room);
  }, 90000);
}

function handleTimeOut(io: Server, roomId: string, room: GameRoom) {
  if (!room.currentTurn) return;

  // Log timeout
  const currentPlayerName = getPlayerName(room, room.currentTurn);
  analyticsManager.logTimeout(roomId, room.currentTurn, currentPlayerName);

  if (room.currentPhase === "play_or_discard") {
    passTurn(io, roomId, room);
  } else if (room.currentPhase === "draw") {
    autoDraw(io, roomId, room);
  } else if (room.currentPhase === "end_turn") {
    passTurn(io, roomId, room);
  }
}

function passTurn(io: Server, roomId: string, room: GameRoom) {
  // Log turn end for current player
  if (room.currentTurn) {
    const currentPlayerName = getPlayerName(room, room.currentTurn);
    analyticsManager.logTurnEnd(roomId, room.currentTurn, currentPlayerName);
  }

  const currentIndex = room.players.findIndex(
    (p) => p.playerId === room.currentTurn
  );
  const nextIndex = (currentIndex + 1) % room.players.length;
  room.currentTurn = room.players[nextIndex].playerId;
  room.currentPhase =
    room.hands![room.currentTurn].length === 0 ? "draw" : "play_or_discard";

  startTurnTimer(io, roomId, room);

  io.to(roomId).emit("update-game", {
    hands: room.hands,
    boards: room.boards,
    currentTurn: room.currentTurn,
    currentPhase: room.currentPhase,
    discardPile: room.discardPile,
  });
}

function autoDraw(io: Server, roomId: string, room: GameRoom) {
  const playerId = room.currentTurn!;
  while (room.hands![playerId].length < 3 && room.deck?.length) {
    const card = room.deck.shift();
    if (card) room.hands![playerId].push(card);
  }
  room.currentPhase = "end_turn";
  setTimeout(() => passTurn(io, roomId, room), 2000);
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

  socket.on("request-game-state", (roomId: string) => {
    const room = rooms[roomId] as GameRoom;
    if (room && room.has_started && room.hands && room.boards) {
      console.log(
        `Sending current game state to reconnecting player in room ${roomId}`
      );

      // Try to identify the player and log reconnection
      const player = room.players.find((p) => p.socketId === socket.id);
      if (player) {
        const playerName = getPlayerName(room, player.playerId);
        analyticsManager.logReconnection(roomId, player.playerId, playerName);
      }

      socket.emit("deck-shuffled", {
        hands: room.hands,
        boards: room.boards,
        currentTurn: room.currentTurn,
        currentPhase: room.currentPhase,
        playerIdList: room.players.map((p) => p.playerId),
        discardPile: room.discardPile,
        playerNames: room.playerNames,
      });
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

      // Start the timer for the first player
      startTurnTimer(io, roomId, room);

      // Establecer el mapeo de nombres de jugadores
      room.playerNames = room.players.reduce((acc, player) => {
        acc[player.playerId] = player.nickname || player.playerId;
        return acc;
      }, {} as { [playerId: string]: string });

      // Initialize analytics
      analyticsManager.initializeGame(
        roomId,
        room.players.map((p) => p.playerId),
        room.playerNames
      );

      console.log("Player names mapping:", room.playerNames);
      console.log("deck: ", safeStringify(room.deck));
      io.to(roomId).emit("deck-shuffled", {
        hands: room.hands,
        boards: room.boards,
        currentTurn: room.currentTurn,
        currentPhase: room.currentPhase,
        playerIdList: room.players.map((p) => p.playerId),
        discardPile: room.discardPile,
        playerNames: room.playerNames,
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

          // Log deck rebuild
          const currentPlayerName = getPlayerName(room, playerId);
          analyticsManager.logDeckRebuild(roomId, playerId, currentPlayerName);

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

          // Log card discard
          const currentPlayerName = getPlayerName(room, playerId);
          analyticsManager.logCardDiscarded(
            roomId,
            playerId,
            currentPlayerName,
            [cardId]
          );

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
        let canPlay;
        if (card.type === "treatment") {
          // For treatments, use the comprehensive validation function
          canPlay = canPlayTreatment(card, room.boards!, playerId, action);
        } else {
          canPlay = canPlayCard(
            card,
            playerBoard,
            targetBoard,
            action.targetOrganColor
          );
        }
        if (!canPlay.canPlay) {
          // Log invalid move
          const currentPlayerName = getPlayerName(room, playerId);
          analyticsManager.logInvalidMove(
            roomId,
            playerId,
            currentPlayerName,
            canPlay.reason || "Invalid card play"
          );

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
          // Log invalid move
          const currentPlayerName = getPlayerName(room, playerId);
          analyticsManager.logInvalidMove(
            roomId,
            playerId,
            currentPlayerName,
            result.reason || "Card effect failed"
          );

          socket.emit("game-error", result.reason);
          return;
        }

        // Log successful card play
        const currentPlayerName = getPlayerName(room, playerId);
        const turnStartTime = room.turnStartTime || Date.now();
        const turnTime = Date.now() - turnStartTime;

        analyticsManager.logCardPlayed(roomId, playerId, currentPlayerName, {
          cardId: action.cardId,
          cardType: card.type,
          cardColor: card.color,
          targetPlayerId: action.targetPlayerId,
          targetOrganColor: action.targetOrganColor,
          successful: true,
          turnTime,
        });

        // Remover la carta de la mano DESPUÉS de aplicar el efecto exitosamente
        room.hands![playerId].splice(cardIndex, 1);

        // Recalcular estados de todos los órganos después de aplicar la carta
        for (const boardId in room.boards!) {
          for (const organColor in room.boards![boardId].organs) {
            const organState = room.boards![boardId].organs[organColor];
            organState.status = calculateOrganStatus(organState);
          }
        }

        // VERIFICAR CONDICIÓN DE VICTORIA PARA TODOS LOS JUGADORES DESPUÉS DE APLICAR EL EFECTO
        console.log(
          `Checking win condition for all players after applying card effect`
        );
        const winner = checkWinConditionForAllPlayers(room.boards!);
        if (winner) {
          room.winner = winner;
          console.log(`Player ${winner} has won the game!`);

          // Clear the turn timer since the game is over
          if (room.turnTimer) {
            clearTimeout(room.turnTimer);
          }

          // FIRST: Send the final game state so players can see the winning move
          io.to(roomId).emit("update-game", {
            hands: room.hands,
            boards: room.boards,
            currentTurn: room.currentTurn,
            currentPhase: room.currentPhase,
            discardPile: room.discardPile,
          });

          // THEN: Send victory notification (like other game notifications)
          const winnerName = getPlayerName(room, winner);
          io.to(roomId).emit("victory-notification", {
            winner: winnerName,
            winnerId: winner, // Include the actual player ID
            message: `¡${winnerName} ha ganado!`,
          });

          // After 1 seconds, show the victory screen and clean up
          setTimeout(async () => {
            io.to(roomId).emit("game-won", {
              winner: winnerName,
              winnerId: winner, // Include the actual player ID
            });

            // Clear session data for all players
            room.players.forEach((player) => {
              io.to(player.socketId).emit("clear-session-data");
            });

            // End game analytics
            await analyticsManager.endGame(roomId, winner, winnerName);

            // Delete room
            console.log(`Cleaning up room ${roomId} after victory sequence`);
            delete rooms[roomId];
            console.log(`Room ${roomId} has been deleted from server`);
          }, 1000);

          return;
        }

        // Handle special treatment effects and global notifications
        if (result.success && card.type === "treatment") {
          console.log(
            `Treatment used by player: ${playerId} (${currentPlayerName})`
          );

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
                  // Log organ infection
                  analyticsManager.logOrganAction(
                    roomId,
                    playerId,
                    currentPlayerName,
                    {
                      action: "infected",
                      organColor: contagion.organColor,
                      targetPlayerId: contagion.targetPlayer,
                      byPlayerId: playerId,
                      cardType: contagion.bacteriaType,
                    }
                  );

                  io.to(contagion.targetPlayer).emit("organ-infected", {
                    organColor: contagion.organColor,
                    byPlayer: currentPlayerName,
                    cardType: contagion.bacteriaType,
                    reason: "contagion",
                  });
                });
              }
              break;

            case "organ_thief":
              // Log organ theft
              analyticsManager.logOrganAction(
                roomId,
                playerId,
                currentPlayerName,
                {
                  action: "stolen",
                  organColor: action.targetOrganColor!,
                  targetPlayerId: action.targetPlayerId!,
                  byPlayerId: playerId,
                  cardType: card.color,
                }
              );

              io.to(action.targetPlayerId!).emit("organ-stolen", {
                byPlayer: currentPlayerName,
                organColor: action.targetOrganColor,
              });
              break;

            case "transplant":
              // Log organ transplant
              analyticsManager.logOrganAction(
                roomId,
                playerId,
                currentPlayerName,
                {
                  action: "transplanted",
                  organColor: action.targetOrganColor!,
                  targetPlayerId: action.targetPlayerId!,
                  byPlayerId: playerId,
                  cardType: card.color,
                }
              );

              // Notify both players about the transplant
              io.to(action.targetPlayerId!).emit("organ-transplanted", {
                byPlayer: currentPlayerName,
                organGiven: action.targetOrganColor,
                organReceived: action.secondTargetOrganColor,
                otherPlayer: getPlayerName(room, action.secondTargetPlayerId!),
              });
              io.to(action.secondTargetPlayerId!).emit("organ-transplanted", {
                byPlayer: currentPlayerName,
                organGiven: action.secondTargetOrganColor,
                organReceived: action.targetOrganColor,
                otherPlayer: getPlayerName(room, action.targetPlayerId!),
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

        // Emitir eventos específicos para notificaciones de acciones directas
        if (result.success && result.changes) {
          console.log(
            `Direct action by player: ${playerId} (${currentPlayerName})`
          );

          // Handle bacteria and medicine actions against other players
          if (action.targetPlayerId && action.targetPlayerId !== playerId) {
            switch (result.changes.type) {
              case "bacteria_played":
                // Check if organ was destroyed or infected
                const targetOrganAfter =
                  room.boards![action.targetPlayerId].organs[
                    action.targetOrganColor!
                  ];

                if (result.changes.organDestroyed || !targetOrganAfter) {
                  // Log organ destruction
                  analyticsManager.logOrganAction(
                    roomId,
                    playerId,
                    currentPlayerName,
                    {
                      action: "destroyed",
                      organColor: action.targetOrganColor!,
                      targetPlayerId: action.targetPlayerId,
                      byPlayerId: playerId,
                      cardType: card.color,
                    }
                  );

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
                  // Log organ infection
                  analyticsManager.logOrganAction(
                    roomId,
                    playerId,
                    currentPlayerName,
                    {
                      action: "infected",
                      organColor: action.targetOrganColor!,
                      targetPlayerId: action.targetPlayerId,
                      byPlayerId: playerId,
                      cardType: card.color,
                    }
                  );

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
                  // Log organ healing
                  analyticsManager.logOrganAction(
                    roomId,
                    playerId,
                    currentPlayerName,
                    {
                      action: "healed",
                      organColor: action.targetOrganColor!,
                      targetPlayerId: action.targetPlayerId,
                      byPlayerId: playerId,
                      cardType: card.color,
                    }
                  );

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

        // Recalcular estados de todos los órganos después de aplicar la carta
        for (const boardId in room.boards!) {
          for (const organColor in room.boards![boardId].organs) {
            const organState = room.boards![boardId].organs[organColor];
            organState.status = calculateOrganStatus(organState);
          }
        }

        // VERIFICAR CONDICIÓN DE VICTORIA PARA TODOS LOS JUGADORES DESPUÉS DE RECALCULAR ESTADOS
        console.log(
          `Checking win condition for all players after recalculating organ states`
        );
        const winnerAfterRecalc = checkWinConditionForAllPlayers(room.boards!);
        if (winnerAfterRecalc) {
          room.winner = winnerAfterRecalc;
          console.log(
            `Player ${winnerAfterRecalc} has won the game after state recalculation!`
          );

          // Clear the turn timer since the game is over
          if (room.turnTimer) {
            clearTimeout(room.turnTimer);
          }

          // FIRST: Send the final game state so players can see the winning move
          io.to(roomId).emit("update-game", {
            hands: room.hands,
            boards: room.boards,
            currentTurn: room.currentTurn,
            currentPhase: room.currentPhase,
            discardPile: room.discardPile,
          });

          // THEN: Send victory notification (like other game notifications)
          const winnerName = getPlayerName(room, winnerAfterRecalc);
          io.to(roomId).emit("victory-notification", {
            winner: winnerName,
            winnerId: winnerAfterRecalc, // Include the actual player ID
            message: `¡${winnerName} ha ganado!`,
          });

          // After 1 seconds, show the victory screen and clean up
          setTimeout(async () => {
            io.to(roomId).emit("game-won", {
              winner: winnerName,
              winnerId: winnerAfterRecalc, // Include the actual player ID
            });

            // Clear session data for all players
            room.players.forEach((player) => {
              io.to(player.socketId).emit("clear-session-data");
            });

            // End game analytics
            await analyticsManager.endGame(
              roomId,
              winnerAfterRecalc,
              winnerName
            );

            // Delete room
            console.log(`Cleaning up room ${roomId} after victory sequence`);
            delete rooms[roomId];
            console.log(`Room ${roomId} has been deleted from server`);
          }, 1000);

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
      // Use the centralized passTurn function
      passTurn(io, roomId, room);
    }
  });

  // Timer event - send time left to client
  socket.on("get-time-left", (roomId: string) => {
    const room = rooms[roomId] as GameRoom;
    if (room && room.turnStartTime && room.turnTimeLimit) {
      const elapsed = (Date.now() - room.turnStartTime) / 1000;
      const timeLeft = Math.max(0, room.turnTimeLimit - elapsed);
      socket.emit("time-left", { timeLeft: Math.floor(timeLeft) });
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
            console.log(
              `Discarding card ${cardId} at index ${cardIndex} for player ${playerId}`
            );
            console.log(
              `Player hand before discard:`,
              room.hands![playerId].map((c) => ({
                id: c.id,
                type: c.type,
                color: c.color,
              }))
            );

            const discardedCard = room.hands![playerId].splice(cardIndex, 1)[0];
            console.log(`Discarded card:`, {
              id: discardedCard.id,
              type: discardedCard.type,
              color: discardedCard.color,
            });

            discardedCards.push(discardedCard);
            console.log(
              `Player hand after discard:`,
              room.hands![playerId].map((c) => ({
                id: c.id,
                type: c.type,
                color: c.color,
              }))
            );
          }
        });

        room.discardPile!.push(...discardedCards);
        room.currentPhase = "draw";

        // Log multiple card discard
        const currentPlayerName = getPlayerName(room, playerId);
        analyticsManager.logCardDiscarded(
          roomId,
          playerId,
          currentPlayerName,
          cardIds
        );

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
      console.log(`Sending game state to player ${socket.id}`);

      // Try to identify the player and log reconnection
      const player = room.players.find((p) => p.socketId === socket.id);
      if (player) {
        const playerName = getPlayerName(room, player.playerId);
        analyticsManager.logReconnection(roomId, player.playerId, playerName);
      }

      socket.emit("update-game", {
        hands: room.hands,
        boards: room.boards,
        currentTurn: room.currentTurn,
        currentPhase: room.currentPhase,
        discardPile: room.discardPile,
      });
    }
  });
}
