import { useEffect, useState } from "react";
import { useAppContext } from "../../context/AppContext";
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
    console.log("isGameStarted effect:", {
      isGameStarted,
      socket: !!socket,
      isHost,
      roomId,
      playerId,
    });

    if (!isGameStarted || !socket || !roomId) {
      console.log("Early return - conditions not met");
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
      console.log("Received deck-shuffled event:", data);
      console.log(
        "Setting hand for playerId:",
        playerId,
        "cards:",
        data.hands[playerId]?.length
      );
      console.log("Setting boards:", Object.keys(data.boards || {}));
      console.log("Setting currentTurn:", data.currentTurn);
      console.log("Setting playerNames:", data.playerNames);

      setHand(data.hands[playerId] || []);
      setBoards(data.boards || {});
      setCurrentTurn(data.currentTurn);
      setCurrentPhase(data.currentPhase);
      if (data.playerNames) {
        setPlayerNames(data.playerNames);
      }
    });

    socket?.on("update-game", (data) => {
      console.log("Received update-game event:", data);
      console.log(
        "Updating hand for playerId:",
        playerId,
        "cards:",
        data.hands[playerId]?.length
      );
      console.log("Updating boards:", Object.keys(data.boards || {}));

      // Detectar si se robaron cartas
      const previousHandSize = hand.length;
      const newHandSize = data.hands[playerId]?.length || 0;
      const cardsDifference = newHandSize - previousHandSize;

      setHand(data.hands[playerId] || []);
      setBoards(data.boards || {});
      setCurrentTurn(data.currentTurn);
      setCurrentPhase(data.currentPhase);
      if (data.playerNames) {
        setPlayerNames(data.playerNames);
      }

      // Notificar sobre cartas robadas (solo si aumentó la mano)
      if (cardsDifference > 0 && previousHandSize > 0) {
        gameNotifications.cardsDrawn(cardsDifference);
      }
    });

    socket?.on("game-won", (data) => {
      setWinner(data.winner);
      if (data.winner === playerId) {
        gameNotifications.gameWon();
      } else {
        gameNotifications.gameLost(playerNames[data.winner] || data.winner);
      }
    });

    socket?.on("game-error", (error) => {
      setGameError(error);
      gameNotifications.invalidAction(error);
      setTimeout(() => setGameError(""), 3000);
    });

    socket?.on("deck-rebuilt", (data) => {
      console.log("Deck was rebuilt with", data.deckSize, "cards");
      gameNotifications.deckRebuilt(data.deckSize);
    });

    // Eventos de notificaciones específicas del juego
    socket?.on("organ-infected", (data) => {
      gameNotifications.organInfected(data.organColor, data.byPlayer);
    });

    socket?.on("organ-destroyed", (data) => {
      gameNotifications.organDestroyed(data.organColor, data.byPlayer);
    });

    socket?.on("vaccine-destroyed", (data) => {
      showNotification({
        type: "warning",
        message: `Your ${data.organColor} organ's vaccine was destroyed by ${data.byPlayer}!`,
        icon: "💥",
      });
    });

    socket?.on("organ-treated", (data) => {
      if (data.treatmentType === "healthy") {
        gameNotifications.organCured(data.organColor);
      } else if (data.treatmentType === "vaccinated") {
        // No notificamos la vacunación por otros jugadores, solo si es beneficiosa
      } else if (data.treatmentType === "immunized") {
        gameNotifications.organImmunized(data.organColor);
      }
    });

    socket?.on("organ-stolen", (data) => {
      gameNotifications.organStolen(data.organColor, data.byPlayer);
    });

    socket?.on("medical-error-used", (data) => {
      gameNotifications.medicalError(data.byPlayer);
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
      socket?.off("organ-stolen");
      socket?.off("medical-error-used");
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
      gameNotifications.cardDiscarded();
    } else if (!canPlay) {
      gameNotifications.cannotPlayCard("It's not your turn");
    }
  };

  const handleDiscardMultiple = (cardIds: string[]) => {
    if (socket && canPlay) {
      socket.emit("discard-cards", roomId, playerId, cardIds);
      gameNotifications.cardDiscarded();
    } else if (!canPlay) {
      gameNotifications.cannotPlayCard("It's not your turn");
    }
  };

  const handlePlayCard = (action: PlayCardAction) => {
    if (socket && canPlay) {
      const card = hand.find((c) => c.id === action.cardId);
      socket.emit("play-card", roomId, playerId, action);

      // Notificaciones más específicas basadas en el tipo de carta y acción
      if (card) {
        if (card.type === "organ") {
          gameNotifications.cardPlayed(`${card.color} organ`);
        } else if (card.type === "virus") {
          const targetPlayerName = action.targetPlayerId
            ? playerNames[action.targetPlayerId] || action.targetPlayerId
            : "target";
          if (action.targetPlayerId === playerId) {
            gameNotifications.cardPlayed(
              `${card.color} virus on your own organ`
            );
          } else {
            gameNotifications.cardPlayed(
              `${card.color} virus on ${targetPlayerName}'s organ`
            );
          }
        } else if (card.type === "medicine") {
          const targetPlayerName = action.targetPlayerId
            ? playerNames[action.targetPlayerId] || action.targetPlayerId
            : "target";
          if (action.targetPlayerId === playerId) {
            gameNotifications.cardPlayed(
              `${card.color} medicine on your organ`
            );
          } else {
            gameNotifications.cardPlayed(
              `${card.color} medicine on ${targetPlayerName}'s organ`
            );
          }
        } else if (card.type === "treatment") {
          gameNotifications.cardPlayed(`${card.color} treatment`);
        } else {
          gameNotifications.cardPlayed(card.type);
        }
      }
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
