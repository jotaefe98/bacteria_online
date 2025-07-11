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
exports.startPeriodicReports = exports.generatePlayerReport = exports.generateAnalyticsReport = exports.AnalyticsDashboard = void 0;
const analytics_1 = require("../utils/analytics");
const logger_1 = require("../utils/logger");
class AnalyticsDashboard {
    // Generate a comprehensive analytics report
    static generateReport() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                logger_1.logger.log("\n======= BACTERIA ONLINE ANALYTICS REPORT =======");
                // Get aggregated statistics
                const aggregatedStats = yield analytics_1.analyticsManager.getAggregatedStatsFromDatabase();
                if (aggregatedStats) {
                    logger_1.logger.log("\n📊 GENERAL STATISTICS:");
                    logger_1.logger.log(`Total Games Played: ${aggregatedStats.totalGames}`);
                    logger_1.logger.log(`Average Game Duration: ${Math.round(aggregatedStats.averageDuration / 1000 / 60)} minutes`);
                    logger_1.logger.log(`Average Players per Game: ${aggregatedStats.averagePlayerCount.toFixed(1)}`);
                    logger_1.logger.log(`Average Turns per Game: ${aggregatedStats.averageTurns.toFixed(1)}`);
                    logger_1.logger.log(`Total Deck Rebuilds: ${aggregatedStats.totalDeckRebuilds}`);
                }
                // Get player statistics
                const playerStats = yield analytics_1.analyticsManager.getPlayerStatsFromDatabase();
                if (playerStats.length > 0) {
                    logger_1.logger.log("\n🏆 TOP PLAYERS:");
                    playerStats.slice(0, 10).forEach((player, index) => {
                        const winRate = player.gamesPlayed > 0
                            ? ((player.wins / player.gamesPlayed) * 100).toFixed(1)
                            : "0";
                        logger_1.logger.log(`${index + 1}. ${player._id}: ${player.gamesPlayed} games, ${player.wins} wins (${winRate}% win rate)`);
                    });
                }
                // Get recent games
                const recentGames = yield analytics_1.analyticsManager.getRecentGamesFromDatabase(5);
                if (recentGames.length > 0) {
                    logger_1.logger.log("\n🎮 RECENT GAMES:");
                    recentGames.forEach((game, index) => {
                        const date = new Date(game.startTime).toLocaleDateString();
                        const duration = Math.round((game.duration || 0) / 1000 / 60);
                        logger_1.logger.log(`${index + 1}. ${date} - ${game.playerCount} players, ${duration} min, Winner: ${game.winnerName || "Unknown"}`);
                    });
                }
                logger_1.logger.log("\n===============================================\n");
            }
            catch (error) {
                logger_1.logger.error("Error generating analytics report:", error);
            }
        });
    }
    // Generate player-specific report
    static generatePlayerReport(playerName) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const playerStats = yield analytics_1.analyticsManager.getPlayerStatsFromDatabase();
                const player = playerStats.find((p) => p._id === playerName);
                if (!player) {
                    logger_1.logger.log(`Player "${playerName}" not found in database`);
                    return;
                }
                logger_1.logger.log(`\n======= PLAYER REPORT: ${playerName} =======`);
                logger_1.logger.log(`Games Played: ${player.gamesPlayed}`);
                logger_1.logger.log(`Wins: ${player.wins}`);
                logger_1.logger.log(`Win Rate: ${((player.wins / player.gamesPlayed) * 100).toFixed(1)}%`);
                logger_1.logger.log(`Total Cards Played: ${player.totalCardsPlayed}`);
                logger_1.logger.log(`Total Treatments Used: ${player.totalTreatmentsUsed}`);
                logger_1.logger.log(`Total Timeouts: ${player.totalTimeouts}`);
                logger_1.logger.log(`Average Turn Time: ${Math.round(player.averageTurnTime / 1000)}s`);
                logger_1.logger.log(`Total Organs Destroyed: ${player.totalOrgansDestroyed}`);
                logger_1.logger.log(`Total Organs Healed: ${player.totalOrgansHealed}`);
                logger_1.logger.log("\n===============================================\n");
            }
            catch (error) {
                logger_1.logger.error("Error generating player report:", error);
            }
        });
    }
    // Schedule automatic reports
    static startPeriodicReports() {
        // Generate a report every 24 hours
        setInterval(() => __awaiter(this, void 0, void 0, function* () {
            yield this.generateReport();
        }), 24 * 60 * 60 * 1000); // 24 hours
    }
}
exports.AnalyticsDashboard = AnalyticsDashboard;
// Export functions for easy use
exports.generateAnalyticsReport = AnalyticsDashboard.generateReport;
exports.generatePlayerReport = AnalyticsDashboard.generatePlayerReport;
exports.startPeriodicReports = AnalyticsDashboard.startPeriodicReports;
