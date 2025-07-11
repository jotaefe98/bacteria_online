import { analyticsManager } from "../utils/analytics";

// Simple analytics viewer - now with database support
export async function logAnalyticsSummary(roomId: string) {
  // First check if game is still in memory
  const analytics = analyticsManager.getGameAnalytics(roomId);

  if (analytics) {
    console.log(`Found active game analytics for room ${roomId}`);
    logGameSummary(analytics);
    return;
  }

  // If not in memory, try to find by gameId in database
  const gameId = `${roomId}_`;
  const recentGames = await analyticsManager.getRecentGamesFromDatabase(50);
  const gameFromDb = recentGames.find((game) => game.gameId.startsWith(gameId));

  if (gameFromDb) {
    console.log(
      `Found completed game analytics for room ${roomId} in database`
    );
    logGameSummary(gameFromDb);
    return;
  }

  console.log(`No analytics found for room ${roomId}`);
}

function logGameSummary(analytics: any) {
  console.log("\n=== GAME ANALYTICS SUMMARY ===");
  console.log(`Game ID: ${analytics.gameId}`);
  console.log(`Room ID: ${analytics.roomId}`);
  console.log(
    `Duration: ${
      analytics.duration ? Math.round(analytics.duration / 1000) : "N/A"
    } seconds`
  );
  console.log(`Players: ${analytics.playerCount}`);
  console.log(`Total Turns: ${analytics.totalTurns}`);
  console.log(`Deck Rebuilds: ${analytics.deckRebuilds}`);
  console.log(`Winner: ${analytics.winnerName || "Game in progress"}`);

  console.log("\n=== PLAYER STATS ===");
  analytics.players.forEach((player: any) => {
    console.log(`\n${player.playerName}:`);
    console.log(`  - Turns played: ${player.turnsPlayed}`);
    console.log(`  - Cards played: ${player.cardsPlayed}`);
    console.log(`  - Cards discarded: ${player.cardsDiscarded}`);
    console.log(`  - Treatments used: ${player.treatmentsUsed}`);
    console.log(`  - Timeouts: ${player.timeouts}`);
    console.log(
      `  - Avg turn time: ${Math.round(player.averageTurnTime / 1000)}s`
    );
    console.log(`  - Reconnections: ${player.reconnections}`);
    console.log(`  - Invalid moves: ${player.invalidMoves}`);
    console.log(`  - Organs destroyed: ${player.organStats.organsDestroyed}`);
    console.log(`  - Organs healed: ${player.organStats.organsHealed}`);
    console.log(`  - Organs infected: ${player.organStats.organsInfected}`);
    console.log(`  - Organs stolen: ${player.organStats.organsStolen}`);
  });

  console.log("\n=== RECENT EVENTS ===");
  const recentEvents = analytics.gameEvents.slice(-10);
  recentEvents.forEach((event: any) => {
    const time = new Date(event.timestamp).toLocaleTimeString();
    console.log(`[${time}] ${event.playerName}: ${event.type}`);
  });

  console.log("\n===============================\n");
}

// Export for potential future use
export async function getGameStats(roomId: string) {
  // First check memory
  const memoryStats = analyticsManager.getGameAnalytics(roomId);
  if (memoryStats) return memoryStats;

  // Then check database
  const gameId = `${roomId}_`;
  const recentGames = await analyticsManager.getRecentGamesFromDatabase(50);
  return recentGames.find((game) => game.gameId.startsWith(gameId)) || null;
}

// Get overall statistics
export async function getOverallStats() {
  return await analyticsManager.getAggregatedStatsFromDatabase();
}

// Get player leaderboard
export async function getPlayerLeaderboard(limit: number = 10) {
  return await analyticsManager.getPlayerStatsFromDatabase();
}
