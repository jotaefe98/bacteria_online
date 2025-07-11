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
exports.logAnalyticsSummary = logAnalyticsSummary;
exports.getGameStats = getGameStats;
exports.getOverallStats = getOverallStats;
exports.getPlayerLeaderboard = getPlayerLeaderboard;
const analytics_1 = require("../utils/analytics");
// Simple analytics viewer - now with database support
function logAnalyticsSummary(roomId) {
    return __awaiter(this, void 0, void 0, function* () {
        // First check if game is still in memory
        const analytics = analytics_1.analyticsManager.getGameAnalytics(roomId);
        if (analytics) {
            console.log(`Found active game analytics for room ${roomId}`);
            logGameSummary(analytics);
            return;
        }
        // If not in memory, try to find by gameId in database
        const gameId = `${roomId}_`;
        const recentGames = yield analytics_1.analyticsManager.getRecentGamesFromDatabase(50);
        const gameFromDb = recentGames.find((game) => game.gameId.startsWith(gameId));
        if (gameFromDb) {
            console.log(`Found completed game analytics for room ${roomId} in database`);
            logGameSummary(gameFromDb);
            return;
        }
        console.log(`No analytics found for room ${roomId}`);
    });
}
function logGameSummary(analytics) {
    console.log("\n=== GAME ANALYTICS SUMMARY ===");
    console.log(`Game ID: ${analytics.gameId}`);
    console.log(`Room ID: ${analytics.roomId}`);
    console.log(`Duration: ${analytics.duration ? Math.round(analytics.duration / 1000) : "N/A"} seconds`);
    console.log(`Players: ${analytics.playerCount}`);
    console.log(`Total Turns: ${analytics.totalTurns}`);
    console.log(`Deck Rebuilds: ${analytics.deckRebuilds}`);
    console.log(`Winner: ${analytics.winnerName || "Game in progress"}`);
    console.log("\n=== PLAYER STATS ===");
    analytics.players.forEach((player) => {
        console.log(`\n${player.playerName}:`);
        console.log(`  - Turns played: ${player.turnsPlayed}`);
        console.log(`  - Cards played: ${player.cardsPlayed}`);
        console.log(`  - Cards discarded: ${player.cardsDiscarded}`);
        console.log(`  - Treatments used: ${player.treatmentsUsed}`);
        console.log(`  - Timeouts: ${player.timeouts}`);
        console.log(`  - Avg turn time: ${Math.round(player.averageTurnTime / 1000)}s`);
        console.log(`  - Reconnections: ${player.reconnections}`);
        console.log(`  - Invalid moves: ${player.invalidMoves}`);
        console.log(`  - Organs destroyed: ${player.organStats.organsDestroyed}`);
        console.log(`  - Organs healed: ${player.organStats.organsHealed}`);
        console.log(`  - Organs infected: ${player.organStats.organsInfected}`);
        console.log(`  - Organs stolen: ${player.organStats.organsStolen}`);
    });
    console.log("\n=== RECENT EVENTS ===");
    const recentEvents = analytics.gameEvents.slice(-10);
    recentEvents.forEach((event) => {
        const time = new Date(event.timestamp).toLocaleTimeString();
        console.log(`[${time}] ${event.playerName}: ${event.type}`);
    });
    console.log("\n===============================\n");
}
// Export for potential future use
function getGameStats(roomId) {
    return __awaiter(this, void 0, void 0, function* () {
        // First check memory
        const memoryStats = analytics_1.analyticsManager.getGameAnalytics(roomId);
        if (memoryStats)
            return memoryStats;
        // Then check database
        const gameId = `${roomId}_`;
        const recentGames = yield analytics_1.analyticsManager.getRecentGamesFromDatabase(50);
        return recentGames.find((game) => game.gameId.startsWith(gameId)) || null;
    });
}
// Get overall statistics
function getOverallStats() {
    return __awaiter(this, void 0, void 0, function* () {
        return yield analytics_1.analyticsManager.getAggregatedStatsFromDatabase();
    });
}
// Get player leaderboard
function getPlayerLeaderboard() {
    return __awaiter(this, arguments, void 0, function* (limit = 10) {
        return yield analytics_1.analyticsManager.getPlayerStatsFromDatabase();
    });
}
