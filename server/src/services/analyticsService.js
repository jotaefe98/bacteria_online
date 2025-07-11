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
exports.analyticsService = exports.AnalyticsService = void 0;
const database_1 = require("../config/database");
const logger_1 = require("../utils/logger");
class AnalyticsService {
    // Save completed game to database
    saveGameAnalytics(gameAnalytics) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield database_1.databaseManager.ensureConnection();
                const collection = database_1.databaseManager.getGamesCollection();
                if (!collection) {
                    logger_1.logger.error("Database collection not available");
                    return false;
                }
                // Insert the game analytics
                const result = yield collection.insertOne(gameAnalytics);
                if (result.acknowledged) {
                    logger_1.logger.log(`Game analytics saved successfully for game ${gameAnalytics.gameId}`);
                    return true;
                }
                else {
                    logger_1.logger.error(`Failed to save game analytics for game ${gameAnalytics.gameId}`);
                    return false;
                }
            }
            catch (error) {
                logger_1.logger.error("Error saving game analytics:", error);
                return false;
            }
        });
    }
    // Get game analytics by ID
    getGameAnalytics(gameId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield database_1.databaseManager.ensureConnection();
                const collection = database_1.databaseManager.getGamesCollection();
                if (!collection) {
                    logger_1.logger.error("Database collection not available");
                    return null;
                }
                const result = yield collection.findOne({ gameId });
                return result || null;
            }
            catch (error) {
                logger_1.logger.error("Error fetching game analytics:", error);
                return null;
            }
        });
    }
    // Get recent games (last N games)
    getRecentGames() {
        return __awaiter(this, arguments, void 0, function* (limit = 10) {
            try {
                yield database_1.databaseManager.ensureConnection();
                const collection = database_1.databaseManager.getGamesCollection();
                if (!collection) {
                    logger_1.logger.error("Database collection not available");
                    return [];
                }
                const result = yield collection
                    .find({})
                    .sort({ endTime: -1 })
                    .limit(limit)
                    .toArray();
                return result;
            }
            catch (error) {
                logger_1.logger.error("Error fetching recent games:", error);
                return [];
            }
        });
    }
    // Get games by date range
    getGamesByDateRange(startDate, endDate) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield database_1.databaseManager.ensureConnection();
                const collection = database_1.databaseManager.getGamesCollection();
                if (!collection) {
                    logger_1.logger.error("Database collection not available");
                    return [];
                }
                const result = yield collection
                    .find({
                    startTime: {
                        $gte: startDate.getTime(),
                        $lte: endDate.getTime(),
                    },
                })
                    .sort({ startTime: -1 })
                    .toArray();
                return result;
            }
            catch (error) {
                logger_1.logger.error("Error fetching games by date range:", error);
                return [];
            }
        });
    }
    // Get aggregated statistics
    getAggregatedStats() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield database_1.databaseManager.ensureConnection();
                const collection = database_1.databaseManager.getGamesCollection();
                if (!collection) {
                    logger_1.logger.error("Database collection not available");
                    return null;
                }
                const stats = yield collection
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
                return (stats[0] || {
                    totalGames: 0,
                    averageDuration: 0,
                    averagePlayerCount: 0,
                    averageTurns: 0,
                    totalDeckRebuilds: 0,
                });
            }
            catch (error) {
                logger_1.logger.error("Error fetching aggregated stats:", error);
                return null;
            }
        });
    }
    // Get player statistics (most active players by name)
    getPlayerStats() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield database_1.databaseManager.ensureConnection();
                const collection = database_1.databaseManager.getGamesCollection();
                if (!collection) {
                    logger_1.logger.error("Database collection not available");
                    return [];
                }
                const stats = yield collection
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
            }
            catch (error) {
                logger_1.logger.error("Error fetching player stats:", error);
                return [];
            }
        });
    }
    // Get card usage statistics
    getCardUsageStats() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield database_1.databaseManager.ensureConnection();
                const collection = database_1.databaseManager.getGamesCollection();
                if (!collection) {
                    logger_1.logger.error("Database collection not available");
                    return [];
                }
                const stats = yield collection
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
            }
            catch (error) {
                logger_1.logger.error("Error fetching card usage stats:", error);
                return [];
            }
        });
    }
    // Delete old games (cleanup)
    deleteOldGames() {
        return __awaiter(this, arguments, void 0, function* (olderThanDays = 30) {
            try {
                yield database_1.databaseManager.ensureConnection();
                const collection = database_1.databaseManager.getGamesCollection();
                if (!collection) {
                    logger_1.logger.error("Database collection not available");
                    return 0;
                }
                const cutoffDate = new Date();
                cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);
                const result = yield collection.deleteMany({
                    startTime: { $lt: cutoffDate.getTime() },
                });
                logger_1.logger.log(`Deleted ${result.deletedCount} old games`);
                return result.deletedCount;
            }
            catch (error) {
                logger_1.logger.error("Error deleting old games:", error);
                return 0;
            }
        });
    }
}
exports.AnalyticsService = AnalyticsService;
exports.analyticsService = new AnalyticsService();
