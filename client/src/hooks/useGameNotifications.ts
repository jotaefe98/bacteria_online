import toast from "react-hot-toast";

export interface GameNotification {
  type: "success" | "error" | "info" | "warning";
  message: string;
  icon?: string;
}

export const useGameNotifications = () => {
  const showNotification = ({ type, message, icon }: GameNotification) => {
    const baseStyle = {
      background: "#363636",
      color: "#fff",
      borderRadius: "10px",
      padding: "12px 16px",
      boxShadow: "0 8px 20px rgba(0,0,0,0.3)",
      fontSize: "14px",
      fontWeight: "500",
    };

    switch (type) {
      case "success":
        toast.success(message, {
          icon: icon || "✅",
          style: { ...baseStyle, borderLeft: "4px solid #10B981" },
        });
        break;
      case "error":
        toast.error(message, {
          icon: icon || "❌",
          style: { ...baseStyle, borderLeft: "4px solid #EF4444" },
        });
        break;
      case "warning":
        toast(message, {
          icon: icon || "⚠️",
          style: { ...baseStyle, borderLeft: "4px solid #F59E0B" },
        });
        break;
      case "info":
        toast(message, {
          icon: icon || "ℹ️",
          style: { ...baseStyle, borderLeft: "4px solid #3B82F6" },
        });
        break;
    }
  };

  // Notificaciones específicas del juego
  const gameNotifications = {
    // Acciones exitosas
    cardPlayed: (cardType: string) =>
      showNotification({
        type: "success",
        message: `${cardType} played successfully!`,
        icon: "🎯",
      }),

    cardDiscarded: () =>
      showNotification({
        type: "info",
        message: "Card discarded",
        icon: "🗑️",
      }),

    cardsDrawn: (count: number) =>
      showNotification({
        type: "success",
        message: `Drew ${count} card${count > 1 ? "s" : ""}`,
        icon: "🃏",
      }),

    // Acciones de otros jugadores que te afectan
    organInfected: (organColor: string, byPlayer: string) =>
      showNotification({
        type: "warning",
        message: `Your ${organColor} organ was infected by ${byPlayer}!`,
        icon: "🦠",
      }),

    organDestroyed: (organColor: string, byPlayer: string) =>
      showNotification({
        type: "error",
        message: `Your ${organColor} organ was destroyed by ${byPlayer}!`,
        icon: "💀",
      }),

    organStolen: (organColor: string, byPlayer: string) =>
      showNotification({
        type: "error",
        message: `Your ${organColor} organ was stolen by ${byPlayer}!`,
        icon: "🥷",
      }),

    virusBlocked: (organColor: string) =>
      showNotification({
        type: "success",
        message: `Virus blocked! Your ${organColor} organ is protected`,
        icon: "🛡️",
      }),

    organCured: (organColor: string) =>
      showNotification({
        type: "success",
        message: `Your ${organColor} organ was cured!`,
        icon: "💊",
      }),

    organImmunized: (organColor: string) =>
      showNotification({
        type: "success",
        message: `Your ${organColor} organ is now immunized!`,
        icon: "🛡️",
      }),

    // Errores de acción
    invalidAction: (reason: string) =>
      showNotification({
        type: "error",
        message: `Cannot perform action: ${reason}`,
        icon: "🚫",
      }),

    cannotPlayCard: (reason: string) =>
      showNotification({
        type: "error",
        message: `Cannot play card: ${reason}`,
        icon: "🚫",
      }),

    // Estados del juego
    yourTurn: () =>
      showNotification({
        type: "info",
        message: "It's your turn!",
        icon: "🎯",
      }),

    gameWon: () =>
      showNotification({
        type: "success",
        message: "Congratulations! You won the game!",
        icon: "🏆",
      }),

    gameLost: (winner: string) =>
      showNotification({
        type: "info",
        message: `Game over! ${winner} won the game`,
        icon: "🎮",
      }),

    deckRebuilt: (cardCount: number) =>
      showNotification({
        type: "info",
        message: `Deck reshuffled with ${cardCount} cards`,
        icon: "🔄",
      }),

    // Tratamientos especiales
    medicalError: (targetPlayer: string) =>
      showNotification({
        type: "warning",
        message: `Medical Error used on ${targetPlayer}`,
        icon: "🩺",
      }),

    latexGlove: () =>
      showNotification({
        type: "success",
        message: "Latex Glove protected you from infection!",
        icon: "🧤",
      }),

    contagion: (affectedPlayers: string[]) =>
      showNotification({
        type: "warning",
        message: `Contagion spread! ${affectedPlayers.length} players affected`,
        icon: "🦠",
      }),

    // Notificaciones de bloqueo/protección
    actionBlocked: (reason: string) =>
      showNotification({
        type: "info",
        message: `Action blocked: ${reason}`,
        icon: "🛡️",
      }),

    organProtected: (organColor: string) =>
      showNotification({
        type: "success",
        message: `Your ${organColor} organ resisted the attack!`,
        icon: "🛡️",
      }),

    // Notificaciones de estado de mazo
    deckLow: (cardsLeft: number) =>
      showNotification({
        type: "warning",
        message: `Warning: Only ${cardsLeft} cards left in deck!`,
        icon: "📉",
      }),
  };

  return { showNotification, gameNotifications };
};
