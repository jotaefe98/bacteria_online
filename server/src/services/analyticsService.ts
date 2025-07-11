import { GameAnalytics } from "../types/analytics";
import { databaseManager } from "../config/database";
import { logger } from "../utils/logger";

export class AnalyticsService {
  // Save completed game to database
  async saveGameAnalytics(gameAnalytics: GameAnalytics): Promise<boolean> {
    try {
      // Check if database is connected
      if (!databaseManager.isConnected()) {
        logger.log("Database not connected, skipping analytics save");
        return false;
      }

      await databaseManager.ensureConnection();
      const collection = databaseManager.getGamesCollection();

      if (!collection) {
        logger.error("Database collection not available");
        return false;
      }

      // Insert the game analytics
      const result = await collection.insertOne(gameAnalytics);

      if (result.acknowledged) {
        logger.log(
          `Game analytics saved successfully for game ${gameAnalytics.gameId}`
        );
        return true;
      } else {
        logger.error(
          `Failed to save game analytics for game ${gameAnalytics.gameId}`
        );
        return false;
      }
    } catch (error) {
      logger.error("Error saving game analytics:", error);

      // If it's a connection error, try to reconnect
      if (error instanceof Error && error.message.includes("connection")) {
        logger.log("Attempting to reconnect to database...");
        await databaseManager.ensureConnection();
      }

      return false;
    }
  }

  // Get game analytics by ID
  async getGameAnalytics(gameId: string): Promise<GameAnalytics | null> {
    try {
      // Check if database is connected
      if (!databaseManager.isConnected()) {
        logger.log("Database not connected, cannot retrieve analytics");
        return null;
      }

      await databaseManager.ensureConnection();
      const collection = databaseManager.getGamesCollection();

      if (!collection) {
        logger.error("Database collection not available");
        return null;
      }

      const result = await collection.findOne({ gameId });
      return result || null;
    } catch (error) {
      logger.error("Error fetching game analytics:", error);
      return null;
    }
  }

  // Get recent games (last N games)
  async getRecentGames(limit: number = 10): Promise<GameAnalytics[]> {
    try {
      await databaseManager.ensureConnection();
      const collection = databaseManager.getGamesCollection();

      if (!collection) {
        logger.error("Database collection not available");
        return [];
      }

      const result = await collection
        .find({})
        .sort({ endTime: -1 })
        .limit(limit)
        .toArray();

      return result;
    } catch (error) {
      logger.error("Error fetching recent games:", error);
      return [];
    }
  }

  // Get games by date range
  async getGamesByDateRange(
    startDate: Date,
    endDate: Date
  ): Promise<GameAnalytics[]> {
    try {
      await databaseManager.ensureConnection();
      const collection = databaseManager.getGamesCollection();

      if (!collection) {
        logger.error("Database collection not available");
        return [];
      }

      const result = await collection
        .find({
          startTime: {
            $gte: startDate.getTime(),
            $lte: endDate.getTime(),
          },
        })
        .sort({ startTime: -1 })
        .toArray();

      return result;
    } catch (error) {
      logger.error("Error fetching games by date range:", error);
      return [];
    }
  }

  // Get aggregated statistics
  async getAggregatedStats(): Promise<any> {
    try {
      await databaseManager.ensureConnection();
      const collection = databaseManager.getGamesCollection();

      if (!collection) {
        logger.error("Database collection not available");
        return null;
      }

      const stats = await collection
        .aggregate([
          {
            $group: {
              _id: null,
              totalGames: { $sum: 1 },
              averageDuration: { $avg: "$duration" },
              averagePlayerCount: { $avg: "$playerCount" },
              averageTurns: { $avg: "$totalTurns" },
              totalDeckRebuilds: { $sum: "$deckRebuilds" },
            },
          },
        ])
        .toArray();

      return (
        stats[0] || {
          totalGames: 0,
          averageDuration: 0,
          averagePlayerCount: 0,
          averageTurns: 0,
          totalDeckRebuilds: 0,
        }
      );
    } catch (error) {
      logger.error("Error fetching aggregated stats:", error);
      return null;
    }
  }

  // Get player statistics (most active players by name)
  async getPlayerStats(): Promise<any[]> {
    try {
      await databaseManager.ensureConnection();
      const collection = databaseManager.getGamesCollection();

      if (!collection) {
        logger.error("Database collection not available");
        return [];
      }

      const stats = await collection
        .aggregate([
          { $unwind: "$players" },
          {
            $group: {
              _id: "$players.playerName",
              gamesPlayed: { $sum: 1 },
              totalCardsPlayed: { $sum: "$players.cardsPlayed" },
              totalTreatmentsUsed: { $sum: "$players.treatmentsUsed" },
              totalTimeouts: { $sum: "$players.timeouts" },
              averageTurnTime: { $avg: "$players.averageTurnTime" },
              totalOrgansDestroyed: {
                $sum: "$players.organStats.organsDestroyed",
              },
              totalOrgansHealed: { $sum: "$players.organStats.organsHealed" },
              wins: {
                $sum: {
                  $cond: [
                    { $eq: ["$players.playerName", "$winnerName"] },
                    1,
                    0,
                  ],
                },
              },
            },
          },
          { $sort: { gamesPlayed: -1 } },
          { $limit: 20 },
        ])
        .toArray();

      return stats;
    } catch (error) {
      logger.error("Error fetching player stats:", error);
      return [];
    }
  }

  // Get card usage statistics
  async getCardUsageStats(): Promise<any[]> {
    try {
      await databaseManager.ensureConnection();
      const collection = databaseManager.getGamesCollection();

      if (!collection) {
        logger.error("Database collection not available");
        return [];
      }

      const stats = await collection
        .aggregate([
          { $unwind: "$gameEvents" },
          { $match: { "gameEvents.type": "card_played" } },
          {
            $group: {
              _id: {
                cardType: "$gameEvents.data.cardType",
                cardColor: "$gameEvents.data.cardColor",
              },
              count: { $sum: 1 },
            },
          },
          { $sort: { count: -1 } },
        ])
        .toArray();

      return stats;
    } catch (error) {
      logger.error("Error fetching card usage stats:", error);
      return [];
    }
  }

  // Delete old games (cleanup)
  async deleteOldGames(olderThanDays: number = 30): Promise<number> {
    try {
      await databaseManager.ensureConnection();
      const collection = databaseManager.getGamesCollection();

      if (!collection) {
        logger.error("Database collection not available");
        return 0;
      }

      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

      const result = await collection.deleteMany({
        startTime: { $lt: cutoffDate.getTime() },
      });

      logger.log(`Deleted ${result.deletedCount} old games`);
      return result.deletedCount;
    } catch (error) {
      logger.error("Error deleting old games:", error);
      return 0;
    }
  }
}

export const analyticsService = new AnalyticsService();
