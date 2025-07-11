import {
  GameAnalytics,
  PlayerAnalytics,
  GameEvent,
  CardPlayedEvent,
  OrganActionEvent,
} from "../types/analytics";
import { logger } from "./logger";
import { analyticsService } from "../services/analyticsService";

class AnalyticsManager {
  private games: Map<string, GameAnalytics> = new Map();
  private currentTurnStartTimes: Map<string, number> = new Map();
  private turnCounters: Map<string, number> = new Map();

  // Initialize game analytics
  initializeGame(
    roomId: string,
    playerIds: string[],
    playerNames: { [key: string]: string }
  ): void {
    const gameId = `${roomId}_${Date.now()}`;
    const startTime = Date.now();

    const players: PlayerAnalytics[] = playerIds.map((playerId) => ({
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

    const gameAnalytics: GameAnalytics = {
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

    this.logEvent(
      roomId,
      "game_start",
      playerIds[0],
      playerNames[playerIds[0]] || playerIds[0],
      {
        playerCount: playerIds.length,
        players: players.map((p) => ({ id: p.playerId, name: p.playerName })),
      }
    );

    logger.log(
      `Game analytics initialized for room ${roomId} with ${playerIds.length} players`
    );
  }

  // Log turn start
  logTurnStart(roomId: string, playerId: string, playerName: string): void {
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
  logTurnEnd(
    roomId: string,
    playerId: string,
    playerName: string,
    reason: "normal" | "timeout" = "normal"
  ): void {
    const turnEndTime = Date.now();
    const turnStartTime = this.currentTurnStartTimes.get(
      `${roomId}_${playerId}`
    );

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
      this.logEvent(
        roomId,
        "turn_end",
        playerId,
        playerName,
        {
          duration: turnDuration,
          reason,
        },
        turnNumber
      );

      this.currentTurnStartTimes.delete(`${roomId}_${playerId}`);
    }
  }

  // Log card played
  logCardPlayed(
    roomId: string,
    playerId: string,
    playerName: string,
    cardEvent: CardPlayedEvent
  ): void {
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
    this.logEvent(
      roomId,
      "card_played",
      playerId,
      playerName,
      cardEvent,
      turnNumber
    );
  }

  // Log card discarded
  logCardDiscarded(
    roomId: string,
    playerId: string,
    playerName: string,
    cardIds: string[]
  ): void {
    const game = this.games.get(roomId);
    if (game) {
      const player = game.players.find((p) => p.playerId === playerId);
      if (player) {
        player.cardsDiscarded += cardIds.length;
      }
    }

    const turnNumber = this.turnCounters.get(roomId) || 0;
    this.logEvent(
      roomId,
      "card_discarded",
      playerId,
      playerName,
      {
        cardIds,
        count: cardIds.length,
      },
      turnNumber
    );
  }

  // Log organ action
  logOrganAction(
    roomId: string,
    playerId: string,
    playerName: string,
    organEvent: OrganActionEvent
  ): void {
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
    this.logEvent(
      roomId,
      "organ_action",
      playerId,
      playerName,
      organEvent,
      turnNumber
    );
  }

  // Log timeout
  logTimeout(roomId: string, playerId: string, playerName: string): void {
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
  logInvalidMove(
    roomId: string,
    playerId: string,
    playerName: string,
    reason: string
  ): void {
    const game = this.games.get(roomId);
    if (game) {
      const player = game.players.find((p) => p.playerId === playerId);
      if (player) {
        player.invalidMoves++;
      }
    }

    const turnNumber = this.turnCounters.get(roomId) || 0;
    this.logEvent(
      roomId,
      "invalid_move",
      playerId,
      playerName,
      { reason },
      turnNumber
    );
  }

  // Log deck rebuild
  logDeckRebuild(roomId: string, playerId: string, playerName: string): void {
    const game = this.games.get(roomId);
    if (game) {
      game.deckRebuilds++;
    }

    const turnNumber = this.turnCounters.get(roomId) || 0;
    this.logEvent(roomId, "deck_rebuilt", playerId, playerName, {}, turnNumber);
  }

  // Log reconnection
  logReconnection(roomId: string, playerId: string, playerName: string): void {
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
  async endGame(
    roomId: string,
    winnerId?: string,
    winnerName?: string
  ): Promise<GameAnalytics | null> {
    const game = this.games.get(roomId);
    if (!game) return null;

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

    this.logEvent(
      roomId,
      "game_end",
      winnerId || "unknown",
      winnerName || "unknown",
      {
        duration: game.duration,
        totalTurns: game.totalTurns,
        deckRebuilds: game.deckRebuilds,
      }
    );

    // Log game summary
    this.logGameSummary(game);

    // Save to database
    await this.saveGameToDatabase(game);

    // Clean up
    this.games.delete(roomId);
    this.turnCounters.delete(roomId);

    return game;
  }

  // Private method to log events
  private logEvent(
    roomId: string,
    type: GameEvent["type"],
    playerId: string,
    playerName: string,
    data?: any,
    turnNumber?: number
  ): void {
    const game = this.games.get(roomId);
    if (game) {
      const event: GameEvent = {
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
  private logGameSummary(game: GameAnalytics): void {
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

    logger.log(`Game Summary for ${game.roomId}:`, summary);
  }

  // Get current game analytics (for debugging)
  getGameAnalytics(roomId: string): GameAnalytics | null {
    return this.games.get(roomId) || null;
  }

  // Get all completed games (for future dashboard)
  async getAllCompletedGames(): Promise<GameAnalytics[]> {
    return await analyticsService.getRecentGames(50);
  }

  // Save game to database
  private async saveGameToDatabase(game: GameAnalytics): Promise<void> {
    try {
      const success = await analyticsService.saveGameAnalytics(game);
      if (success) {
        logger.log(`Game ${game.gameId} saved to database successfully`);
      } else {
        logger.error(`Failed to save game ${game.gameId} to database`);
      }
    } catch (error) {
      logger.error("Error saving game to database:", error);
    }
  }

  // Get analytics from database
  async getGameAnalyticsFromDatabase(
    gameId: string
  ): Promise<GameAnalytics | null> {
    return await analyticsService.getGameAnalytics(gameId);
  }

  // Get recent games from database
  async getRecentGamesFromDatabase(
    limit: number = 10
  ): Promise<GameAnalytics[]> {
    return await analyticsService.getRecentGames(limit);
  }

  // Get aggregated statistics from database
  async getAggregatedStatsFromDatabase(): Promise<any> {
    return await analyticsService.getAggregatedStats();
  }

  // Get player statistics from database
  async getPlayerStatsFromDatabase(): Promise<any[]> {
    return await analyticsService.getPlayerStats();
  }
}

export const analyticsManager = new AnalyticsManager();
