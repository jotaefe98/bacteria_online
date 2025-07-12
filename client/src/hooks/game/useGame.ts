import { useEffect, useState } from "react";
import { useAppContext } from "../../context/AppContext";
import { useSounds } from "../../context/SoundContext";
import type {
  Card,
  PlayerBoard,
  GamePhase,
  PlayCardAction,
} from "../../interfaces/game/gameInterfaces";
import { usePlayerId } from "../usePlayerId";
import { useGameNotifications } from "../useGameNotifications";

type UseGameSocketProps = {
  roomId: string | undefined;
  isGameStarted: boolean;
  isHost: boolean;
};

export function useGame({ roomId, isGameStarted, isHost }: UseGameSocketProps) {
  const { socket } = useAppContext();
  const { playSound } = useSounds();
  const playerId = usePlayerId();
  const { gameNotifications, showNotification } = useGameNotifications();
  const [hand, setHand] = useState<Card[]>([]);
  const [boards, setBoards] = useState<{ [playerId: string]: PlayerBoard }>({});
  const [currentTurn, setCurrentTurn] = useState<string>("");
  const [currentPhase, setCurrentPhase] =
    useState<GamePhase>("play_or_discard");
  const [winner, setWinner] = useState<string | undefined>();
  const [gameError, setGameError] = useState<string>("");
  const [playerNames, setPlayerNames] = useState<{
    [playerId: string]: string;
  }>({});

  const [canDraw, setCanDraw] = useState(false);
  const [canPlay, setCanPlay] = useState(false);
  const [canEndTurn, setCanEndTurn] = useState(false);

  useEffect(() => {
    if (!isGameStarted || !socket || !roomId) {
      return;
    }

    // Añadir un pequeño delay para asegurar que el socket esté completamente conectado
    setTimeout(() => {
      if (isHost) {
        console.log("Game started, shuffling deck...");
        socket.emit("shuffle-deck", roomId);
      } else {
        // Los jugadores no-host solicitan el estado actual del juego
        console.log("Game started, requesting game state...");
        socket.emit("request-game-state", roomId);
      }
    }, 100);
  }, [isGameStarted, socket, isHost, roomId, playerId]);

  useEffect(() => {
    if (!roomId || !socket) return;

    socket?.on("deck-shuffled", (data) => {
      setHand(data.hands[playerId] || []);
      setBoards(data.boards || {});
      setCurrentTurn(data.currentTurn);
      setCurrentPhase(data.currentPhase);
      if (data.playerNames) {
        setPlayerNames(data.playerNames);
      }

      // Play game start sound for all players
      playSound('game_start');

      // Save game session information for persistence
      localStorage.setItem("currentRoomId", roomId!);
      localStorage.setItem("gameStarted", "true");
      // Save game session after deck shuffle
      localStorage.setItem("currentRoomId", roomId);
      localStorage.setItem("gameStarted", "true");
    });
    socket?.on("update-game", (data) => {
      // Quitamos la notificación de cartas robadas - es información redundante
      setHand(data.hands[playerId] || []);
      setBoards(data.boards || {});
      setCurrentTurn(data.currentTurn);
      setCurrentPhase(data.currentPhase);
      if (data.playerNames) {
        setPlayerNames(data.playerNames);
      }

      // Play your turn sound when it's your turn
      if (data.currentTurn === playerId) {
        playSound('your_turn');
      }
    });
    socket?.on("game-won", (data) => {
      // Use winnerId for comparison, but store the winner name for display
      const winnerId = data.winnerId || data.winner;
      setWinner(winnerId);

      if (winnerId === playerId) {
        gameNotifications.gameWon();
        playSound('victory');
      } else {
        gameNotifications.gameLost(playerNames[winnerId] || data.winner);
        playSound('defeat');
      }

      // Clear game session data when game ends
      localStorage.removeItem("currentRoomId");
      localStorage.removeItem("gameStarted");
    });

    socket?.on("clear-session-data", () => {
      // Server is telling us to clear session data (room was deleted)
      localStorage.removeItem("currentRoomId");
      localStorage.removeItem("gameStarted");
      console.log("Game session cleared from localStorage by server request");
    });

    socket?.on("game-error", (error) => {
      setGameError(error);
      gameNotifications.invalidAction(error);
      setTimeout(() => setGameError(""), 3000);
    });

    socket?.on("deck-rebuilt", (data) => {
      gameNotifications.deckRebuilt(data.deckSize);
    });

    // Eventos de notificaciones específicas del juego
    socket?.on("organ-infected", (data) => {
      gameNotifications.organInfected(data.organColor, data.byPlayer);
      // Play bacteria sound when organ is infected but not destroyed
      playSound('bacteria_applied');
    });

    socket?.on("organ-destroyed", (data) => {
      gameNotifications.organDestroyed(data.organColor, data.byPlayer);
      // Play organ death sound when organ is destroyed
      playSound('organ_die');
    });

    socket?.on("vaccine-destroyed", (data) => {
      showNotification({
        type: "warning",
        message: `Your ${data.organColor} organ's vaccine was destroyed by ${data.byPlayer}!`,
        icon: "💥",
      });
    });

    socket?.on("organ-treated", (data) => {
      // Solo notificar si el tratamiento fue beneficioso Y fue hecho por otro jugador
      if (data.treatmentType === "healthy") {
        gameNotifications.organCured(data.organColor);
        // Play medicine sound when organ is cured (not immunized)
        playSound('medicine_applied');
      } else if (data.treatmentType === "immunized") {
        gameNotifications.organImmunized(data.organColor);
        // Play immunization sound when organ becomes immunized
        playSound('organ_inmuniced');
      }
      // No notificamos vacunación, solo curación e inmunización
    });

    socket?.on("organ-vaccinated", (data) => {
      showNotification({
        type: "success",
        message: `${data.byPlayer} vaccinated your ${data.organColor} organ`,
        icon: "💉",
      });
    });

    socket?.on("treatment-used", (data) => {
      // Global notification for treatment usage
      showNotification({
        type: "info",
        message: `${data.byPlayer} used ${data.treatmentName}`,
        icon: "🧪",
      });
      // Play treatment card sound when any treatment is used
      playSound('treatment_card');
    });

    socket?.on("organ-stolen", (data) => {
      gameNotifications.organStolen(data.organColor, data.byPlayer);
    });

    socket?.on("medical-error-used", (data) => {
      gameNotifications.medicalError(data.byPlayer);
    });

    socket?.on("hand-discarded", (data) => {
      if (data.reason === "latex_glove") {
        showNotification({
          type: "warning",
          message: `${data.byPlayer} used Latex Glove - all your cards were discarded!`,
          icon: "🧤",
        });
      }
    });

    socket?.on("organ-transplanted", (data) => {
      showNotification({
        type: "info",
        message: `${data.byPlayer} transplanted your ${data.organGiven} organ with ${data.otherPlayer}'s ${data.organReceived} organ`,
        icon: "🔄",
      });
    });

    socket?.on("contagion-spread", (data) => {
      if (data.affectedPlayers && data.affectedPlayers.length > 0) {
        gameNotifications.contagion(data.affectedPlayers);
      }
    });

    return () => {
      socket?.off("deck-shuffled");
      socket?.off("update-game");
      socket?.off("game-won");
      socket?.off("game-error");
      socket?.off("deck-rebuilt");
      socket?.off("organ-infected");
      socket?.off("organ-destroyed");
      socket?.off("vaccine-destroyed");
      socket?.off("organ-treated");
      socket?.off("organ-vaccinated");
      socket?.off("treatment-used");
      socket?.off("organ-stolen");
      socket?.off("medical-error-used");
      socket?.off("hand-discarded");
      socket?.off("organ-transplanted");
      socket?.off("contagion-spread");
    };
  }, [roomId, socket, playerId]);

  useEffect(() => {
    const isMyTurn = currentTurn === playerId;
    const wasMyTurn = canPlay || canDraw; // Estado anterior

    setCanDraw(isMyTurn && currentPhase === "draw");
    setCanPlay(isMyTurn && currentPhase === "play_or_discard");
    setCanEndTurn(isMyTurn && currentPhase === "end_turn");

    // Notificar cuando empieza tu turno
    if (isMyTurn && !wasMyTurn && currentPhase === "play_or_discard") {
      gameNotifications.yourTurn();
    }

    console.log("Game state update:", {
      playerId,
      currentTurn,
      currentPhase,
      isMyTurn,
      handCount: hand.length,
      boards: Object.keys(boards),
      playerNames,
    });

    // Pasar turno automáticamente cuando el jugador está en la fase "end_turn"
    if (isMyTurn && currentPhase === "end_turn" && socket) {
      console.log("Auto-ending turn for player:", playerId);
      setTimeout(() => {
        socket.emit("end-turn", roomId, playerId);
      }, 500); // Pequeño delay para que el jugador vea el cambio
    }
  }, [
    currentTurn,
    currentPhase,
    playerId,
    hand,
    boards,
    playerNames,
    socket,
    roomId,
  ]);

  const handleDraw = () => {
    if (socket && canDraw) {
      console.log("Drawing card for player:", playerId);
      socket.emit("draw-card", roomId, playerId);
      // La notificación de cartas robadas se mostrará automáticamente en update-game
    } else if (!canDraw) {
      if (currentPhase !== "draw") {
        gameNotifications.cannotPlayCard("It's not the draw phase");
      } else {
        gameNotifications.cannotPlayCard("It's not your turn");
      }
    }
  };

  const handleDiscard = (cardId: string) => {
    if (socket && canPlay) {
      socket.emit("discard-card", roomId, playerId, cardId);
      // Quitamos la notificación de carta descartada - es información redundante
    } else if (!canPlay) {
      gameNotifications.cannotPlayCard("It's not your turn");
    }
  };

  const handleDiscardMultiple = (cardIds: string[]) => {
    if (socket && canPlay) {
      socket.emit("discard-cards", roomId, playerId, cardIds);
      // Quitamos la notificación de cartas descartadas - es información redundante
    } else if (!canPlay) {
      gameNotifications.cannotPlayCard("It's not your turn");
    }
  };

  const handlePlayCard = (action: PlayCardAction) => {
    if (socket && canPlay) {
      socket.emit("play-card", roomId, playerId, action);
      // Quitamos todas las notificaciones de "carta jugada" - son redundantes
      // El servidor ya enviará notificaciones específicas si hay errores
    } else if (!canPlay) {
      gameNotifications.cannotPlayCard("It's not your turn");
    }
  };

  const handleEndTurn = () => {
    if (socket && canEndTurn) {
      socket.emit("end-turn", roomId, playerId);
    }
  };

  return {
    hand,
    boards,
    currentTurn,
    currentPhase,
    winner,
    gameError,
    canDraw,
    canPlay,
    canEndTurn,
    playerId,
    playerNames,
    handleDraw,
    handleDiscard,
    handleDiscardMultiple,
    handlePlayCard,
    handleEndTurn,
  };
}
