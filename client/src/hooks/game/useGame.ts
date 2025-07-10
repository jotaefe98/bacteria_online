import { useEffect, useState } from "react";
import { useAppContext } from "../../context/AppContext";
import type {
  Card,
  PlayerBoard,
  GamePhase,
  PlayCardAction,
} from "../../interfaces/game/gameInterfaces";
import { usePlayerId } from "../usePlayerId";

type UseGameSocketProps = {
  roomId: string | undefined;
  isGameStarted: boolean;
  isHost: boolean;
};

export function useGame({ roomId, isGameStarted, isHost }: UseGameSocketProps) {
  const { socket } = useAppContext();
  const playerId = usePlayerId();
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

      setHand(data.hands[playerId] || []);
      setBoards(data.boards || {});
      setCurrentTurn(data.currentTurn);
      setCurrentPhase(data.currentPhase);
      if (data.playerNames) {
        setPlayerNames(data.playerNames);
      }
    });

    socket?.on("game-won", (data) => {
      setWinner(data.winner);
    });

    socket?.on("game-error", (error) => {
      setGameError(error);
      setTimeout(() => setGameError(""), 3000);
    });

    return () => {
      socket?.off("deck-shuffled");
      socket?.off("update-game");
      socket?.off("game-won");
      socket?.off("game-error");
    };
  }, [roomId, socket, playerId]);

  useEffect(() => {
    const isMyTurn = currentTurn === playerId;
    setCanDraw(isMyTurn && currentPhase === "draw");
    setCanPlay(isMyTurn && currentPhase === "play_or_discard");
    setCanEndTurn(isMyTurn && currentPhase === "end_turn");

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
    }
  };

  const handleDiscard = (cardId: string) => {
    if (socket && canPlay) {
      socket.emit("discard-card", roomId, playerId, cardId);
    }
  };

  const handleDiscardMultiple = (cardIds: string[]) => {
    if (socket && canPlay) {
      socket.emit("discard-cards", roomId, playerId, cardIds);
    }
  };

  const handlePlayCard = (action: PlayCardAction) => {
    if (socket && canPlay) {
      socket.emit("play-card", roomId, playerId, action);
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
