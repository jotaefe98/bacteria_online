// Script para ver datos guardados
import { generateAnalyticsReport } from "../utils/analyticsDashboard";
import { analyticsService } from "../services/analyticsService";

async function viewStoredData() {
  console.log("🔍 VERIFICANDO DATOS GUARDADOS EN MONGODB...\n");

  try {
    // Ver estadísticas generales
    console.log("📊 GENERANDO REPORTE GENERAL:");
    await generateAnalyticsReport();

    // Ver juegos recientes
    console.log("\n🎮 ÚLTIMOS 5 JUEGOS GUARDADOS:");
    const recentGames = await analyticsService.getRecentGames(5);

    if (recentGames.length === 0) {
      console.log("❌ No hay juegos guardados aún.");
      console.log("💡 Juega una partida completa para ver datos aquí.");
    } else {
      recentGames.forEach((game, index) => {
        const date = new Date(game.startTime).toLocaleString();
        const duration = Math.round((game.duration || 0) / 1000 / 60);
        console.log(
          `${index + 1}. ${date} - ${
            game.playerCount
          } jugadores, ${duration} min, Ganador: ${game.winnerName}`
        );
      });
    }

    // Ver estadísticas de jugadores
    console.log("\n🏆 TOP JUGADORES:");
    const playerStats = await analyticsService.getPlayerStats();

    if (playerStats.length === 0) {
      console.log("❌ No hay estadísticas de jugadores aún.");
    } else {
      playerStats.slice(0, 5).forEach((player, index) => {
        const winRate =
          player.gamesPlayed > 0
            ? ((player.wins / player.gamesPlayed) * 100).toFixed(1)
            : "0";
        console.log(
          `${index + 1}. ${player._id}: ${player.gamesPlayed} juegos, ${
            player.wins
          } victorias (${winRate}% win rate)`
        );
      });
    }
  } catch (error) {
    console.error("❌ Error conectando a MongoDB:", error);
    console.log(
      "💡 Verifica que tu archivo .env tenga la URL correcta de MongoDB"
    );
  }
}

// Ejecutar el script
viewStoredData();
