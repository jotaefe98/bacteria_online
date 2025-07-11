import { analyticsManager } from "../utils/analytics";
import { logger } from "../utils/logger";

export class AnalyticsDashboard {
  // Generate a comprehensive analytics report
  static async generateReport(): Promise<void> {
    try {
      logger.log("\n======= BACTERIA ONLINE ANALYTICS REPORT =======");

      // Get aggregated statistics
      const aggregatedStats =
        await analyticsManager.getAggregatedStatsFromDatabase();
      if (aggregatedStats) {
        logger.log("\n📊 GENERAL STATISTICS:");
        logger.log(`Total Games Played: ${aggregatedStats.totalGames}`);
        logger.log(
          `Average Game Duration: ${Math.round(
            aggregatedStats.averageDuration / 1000 / 60
          )} minutes`
        );
        logger.log(
          `Average Players per Game: ${aggregatedStats.averagePlayerCount.toFixed(
            1
          )}`
        );
        logger.log(
          `Average Turns per Game: ${aggregatedStats.averageTurns.toFixed(1)}`
        );
        logger.log(`Total Deck Rebuilds: ${aggregatedStats.totalDeckRebuilds}`);
      }

      // Get player statistics
      const playerStats = await analyticsManager.getPlayerStatsFromDatabase();
      if (playerStats.length > 0) {
        logger.log("\n🏆 TOP PLAYERS:");
        playerStats.slice(0, 10).forEach((player, index) => {
          const winRate =
            player.gamesPlayed > 0
              ? ((player.wins / player.gamesPlayed) * 100).toFixed(1)
              : "0";
          logger.log(
            `${index + 1}. ${player._id}: ${player.gamesPlayed} games, ${
              player.wins
            } wins (${winRate}% win rate)`
          );
        });
      }

      // Get recent games
      const recentGames = await analyticsManager.getRecentGamesFromDatabase(5);
      if (recentGames.length > 0) {
        logger.log("\n🎮 RECENT GAMES:");
        recentGames.forEach((game, index) => {
          const date = new Date(game.startTime).toLocaleDateString();
          const duration = Math.round((game.duration || 0) / 1000 / 60);
          logger.log(
            `${index + 1}. ${date} - ${
              game.playerCount
            } players, ${duration} min, Winner: ${game.winnerName || "Unknown"}`
          );
        });
      }

      logger.log("\n===============================================\n");
    } catch (error) {
      logger.error("Error generating analytics report:", error);
    }
  }

  // Generate player-specific report
  static async generatePlayerReport(playerName: string): Promise<void> {
    try {
      const playerStats = await analyticsManager.getPlayerStatsFromDatabase();
      const player = playerStats.find((p) => p._id === playerName);

      if (!player) {
        logger.log(`Player "${playerName}" not found in database`);
        return;
      }

      logger.log(`\n======= PLAYER REPORT: ${playerName} =======`);
      logger.log(`Games Played: ${player.gamesPlayed}`);
      logger.log(`Wins: ${player.wins}`);
      logger.log(
        `Win Rate: ${((player.wins / player.gamesPlayed) * 100).toFixed(1)}%`
      );
      logger.log(`Total Cards Played: ${player.totalCardsPlayed}`);
      logger.log(`Total Treatments Used: ${player.totalTreatmentsUsed}`);
      logger.log(`Total Timeouts: ${player.totalTimeouts}`);
      logger.log(
        `Average Turn Time: ${Math.round(player.averageTurnTime / 1000)}s`
      );
      logger.log(`Total Organs Destroyed: ${player.totalOrgansDestroyed}`);
      logger.log(`Total Organs Healed: ${player.totalOrgansHealed}`);
      logger.log("\n===============================================\n");
    } catch (error) {
      logger.error("Error generating player report:", error);
    }
  }

  // Schedule automatic reports
  static startPeriodicReports(): void {
    // Generate a report every 24 hours
    setInterval(async () => {
      await this.generateReport();
    }, 24 * 60 * 60 * 1000); // 24 hours
  }
}

// Export functions for easy use
export const generateAnalyticsReport = AnalyticsDashboard.generateReport;
export const generatePlayerReport = AnalyticsDashboard.generatePlayerReport;
export const startPeriodicReports = AnalyticsDashboard.startPeriodicReports;
