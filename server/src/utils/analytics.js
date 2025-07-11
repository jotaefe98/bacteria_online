"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.analyticsManager = void 0;
const logger_1 = require("./logger");
const analyticsService_1 = require("../services/analyticsService");
class AnalyticsManager {
    constructor() {
        this.games = new Map();
        this.currentTurnStartTimes = new Map();
        this.turnCounters = new Map();
    }
    // Initialize game analytics
    initializeGame(roomId, playerIds, playerNames) {
        const gameId = `${roomId}_${Date.now()}`;
        const startTime = Date.now();
        const players = playerIds.map((playerId) => ({
            playerId,
            playerName: playerNames[playerId] || playerId,
            joinTime: startTime,
            turnsPlayed: 0,
            cardsPlayed: 0,
            cardsDiscarded: 0,
            treatmentsUsed: 0,
            timeouts: 0,
            totalTurnTime: 0,
            averageTurnTime: 0,
            reconnections: 0,
            invalidMoves: 0,
            organStats: {
                organsDestroyed: 0,
                organsHealed: 0,
                organsInfected: 0,
                organsStolen: 0,
            },
        }));
        const gameAnalytics = {
            gameId,
            roomId,
            startTime,
            playerCount: playerIds.length,
            players,
            totalTurns: 0,
            deckRebuilds: 0,
            gameEvents: [],
        };
        this.games.set(roomId, gameAnalytics);
        this.turnCounters.set(roomId, 0);
        this.logEvent(roomId, "game_start", playerIds[0], playerNames[playerIds[0]] || playerIds[0], {
            playerCount: playerIds.length,
            players: players.map((p) => ({ id: p.playerId, name: p.playerName })),
        });
        logger_1.logger.log(`Game analytics initialized for room ${roomId} with ${playerIds.length} players`);
    }
    // Log turn start
    logTurnStart(roomId, playerId, playerName) {
        const turnStartTime = Date.now();
        this.currentTurnStartTimes.set(`${roomId}_${playerId}`, turnStartTime);
        const turnNumber = this.turnCounters.get(roomId) || 0;
        this.turnCounters.set(roomId, turnNumber + 1);
        this.logEvent(roomId, "turn_start", playerId, playerName, {}, turnNumber);
        const game = this.games.get(roomId);
        if (game) {
            game.totalTurns++;
            const player = game.players.find((p) => p.playerId === playerId);
            if (player) {
                player.turnsPlayed++;
            }
        }
    }
    // Log turn end
    logTurnEnd(roomId, playerId, playerName, reason = "normal") {
        const turnEndTime = Date.now();
        const turnStartTime = this.currentTurnStartTimes.get(`${roomId}_${playerId}`);
        if (turnStartTime) {
            const turnDuration = turnEndTime - turnStartTime;
            const game = this.games.get(roomId);
            if (game) {
                const player = game.players.find((p) => p.playerId === playerId);
                if (player) {
                    player.totalTurnTime += turnDuration;
                    player.averageTurnTime = player.totalTurnTime / player.turnsPlayed;
                    if (reason === "timeout") {
                        player.timeouts++;
                    }
                }
            }
            const turnNumber = this.turnCounters.get(roomId) || 0;
            this.logEvent(roomId, "turn_end", playerId, playerName, {
                duration: turnDuration,
                reason,
            }, turnNumber);
            this.currentTurnStartTimes.delete(`${roomId}_${playerId}`);
        }
    }
    // Log card played
    logCardPlayed(roomId, playerId, playerName, cardEvent) {
        const game = this.games.get(roomId);
        if (game) {
            const player = game.players.find((p) => p.playerId === playerId);
            if (player) {
                player.cardsPlayed++;
                if (cardEvent.cardType === "treatment") {
                    player.treatmentsUsed++;
                }
            }
        }
        const turnNumber = this.turnCounters.get(roomId) || 0;
        this.logEvent(roomId, "card_played", playerId, playerName, cardEvent, turnNumber);
    }
    // Log card discarded
    logCardDiscarded(roomId, playerId, playerName, cardIds) {
        const game = this.games.get(roomId);
        if (game) {
            const player = game.players.find((p) => p.playerId === playerId);
            if (player) {
                player.cardsDiscarded += cardIds.length;
            }
        }
        const turnNumber = this.turnCounters.get(roomId) || 0;
        this.logEvent(roomId, "card_discarded", playerId, playerName, {
            cardIds,
            count: cardIds.length,
        }, turnNumber);
    }
    // Log organ action
    logOrganAction(roomId, playerId, playerName, organEvent) {
        const game = this.games.get(roomId);
        if (game) {
            const player = game.players.find((p) => p.playerId === playerId);
            if (player) {
                switch (organEvent.action) {
                    case "destroyed":
                        player.organStats.organsDestroyed++;
                        break;
                    case "healed":
                        player.organStats.organsHealed++;
                        break;
                    case "infected":
                        player.organStats.organsInfected++;
                        break;
                    case "stolen":
                        player.organStats.organsStolen++;
                        break;
                }
            }
        }
        const turnNumber = this.turnCounters.get(roomId) || 0;
        this.logEvent(roomId, "organ_action", playerId, playerName, organEvent, turnNumber);
    }
    // Log timeout
    logTimeout(roomId, playerId, playerName) {
        const game = this.games.get(roomId);
        if (game) {
            const player = game.players.find((p) => p.playerId === playerId);
            if (player) {
                player.timeouts++;
            }
        }
        const turnNumber = this.turnCounters.get(roomId) || 0;
        this.logEvent(roomId, "timeout", playerId, playerName, {}, turnNumber);
    }
    // Log invalid move
    logInvalidMove(roomId, playerId, playerName, reason) {
        const game = this.games.get(roomId);
        if (game) {
            const player = game.players.find((p) => p.playerId === playerId);
            if (player) {
                player.invalidMoves++;
            }
        }
        const turnNumber = this.turnCounters.get(roomId) || 0;
        this.logEvent(roomId, "invalid_move", playerId, playerName, { reason }, turnNumber);
    }
    // Log deck rebuild
    logDeckRebuild(roomId, playerId, playerName) {
        const game = this.games.get(roomId);
        if (game) {
            game.deckRebuilds++;
        }
        const turnNumber = this.turnCounters.get(roomId) || 0;
        this.logEvent(roomId, "deck_rebuilt", playerId, playerName, {}, turnNumber);
    }
    // Log reconnection
    logReconnection(roomId, playerId, playerName) {
        const game = this.games.get(roomId);
        if (game) {
            const player = game.players.find((p) => p.playerId === playerId);
            if (player) {
                player.reconnections++;
            }
        }
        const turnNumber = this.turnCounters.get(roomId) || 0;
        this.logEvent(roomId, "reconnection", playerId, playerName, {}, turnNumber);
    }
    // End game
    endGame(roomId, winnerId, winnerName) {
        return __awaiter(this, void 0, void 0, function* () {
            const game = this.games.get(roomId);
            if (!game)
                return null;
            const endTime = Date.now();
            game.endTime = endTime;
            game.duration = endTime - game.startTime;
            game.winner = winnerId;
            game.winnerName = winnerName;
            // Set leave time for all players
            game.players.forEach((player) => {
                if (!player.leaveTime) {
                    player.leaveTime = endTime;
                }
            });
            this.logEvent(roomId, "game_end", winnerId || "unknown", winnerName || "unknown", {
                duration: game.duration,
                totalTurns: game.totalTurns,
                deckRebuilds: game.deckRebuilds,
            });
            // Log game summary
            this.logGameSummary(game);
            // Save to database
            yield this.saveGameToDatabase(game);
            // Clean up
            this.games.delete(roomId);
            this.turnCounters.delete(roomId);
            return game;
        });
    }
    // Private method to log events
    logEvent(roomId, type, playerId, playerName, data, turnNumber) {
        const game = this.games.get(roomId);
        if (game) {
            const event = {
                timestamp: Date.now(),
                type,
                playerId,
                playerName,
                data,
                turnNumber,
            };
            game.gameEvents.push(event);
        }
    }
    // Log game summary for analytics
    logGameSummary(game) {
        const summary = {
            gameId: game.gameId,
            roomId: game.roomId,
            duration: game.duration,
            playerCount: game.playerCount,
            totalTurns: game.totalTurns,
            deckRebuilds: game.deckRebuilds,
            winner: game.winnerName,
            playerStats: game.players.map((p) => ({
                name: p.playerName,
                turnsPlayed: p.turnsPlayed,
                cardsPlayed: p.cardsPlayed,
                treatmentsUsed: p.treatmentsUsed,
                timeouts: p.timeouts,
                averageTurnTime: Math.round(p.averageTurnTime / 1000), // in seconds
                reconnections: p.reconnections,
                invalidMoves: p.invalidMoves,
                organStats: p.organStats,
            })),
        };
        logger_1.logger.log(`Game Summary for ${game.roomId}:`, summary);
    }
    // Get current game analytics (for debugging)
    getGameAnalytics(roomId) {
        return this.games.get(roomId) || null;
    }
    // Get all completed games (for future dashboard)
    getAllCompletedGames() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield analyticsService_1.analyticsService.getRecentGames(50);
        });
    }
    // Save game to database
    saveGameToDatabase(game) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const success = yield analyticsService_1.analyticsService.saveGameAnalytics(game);
                if (success) {
                    logger_1.logger.log(`Game ${game.gameId} saved to database successfully`);
                }
                else {
                    logger_1.logger.error(`Failed to save game ${game.gameId} to database`);
                }
            }
            catch (error) {
                logger_1.logger.error("Error saving game to database:", error);
            }
        });
    }
    // Get analytics from database
    getGameAnalyticsFromDatabase(gameId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield analyticsService_1.analyticsService.getGameAnalytics(gameId);
        });
    }
    // Get recent games from database
    getRecentGamesFromDatabase() {
        return __awaiter(this, arguments, void 0, function* (limit = 10) {
            return yield analyticsService_1.analyticsService.getRecentGames(limit);
        });
    }
    // Get aggregated statistics from database
    getAggregatedStatsFromDatabase() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield analyticsService_1.analyticsService.getAggregatedStats();
        });
    }
    // Get player statistics from database
    getPlayerStatsFromDatabase() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield analyticsService_1.analyticsService.getPlayerStats();
        });
    }
}
exports.analyticsManager = new AnalyticsManager();
