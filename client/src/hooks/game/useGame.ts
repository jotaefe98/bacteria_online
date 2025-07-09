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

  const [canDraw, setCanDraw] = useState(false);
  const [canPlay, setCanPlay] = useState(false);
  const [canEndTurn, setCanEndTurn] = useState(false);

  useEffect(() => {
    if (!isGameStarted || !socket || !isHost) return;
    console.log("Game started, shuffling deck...");
    socket.emit("shuffle-deck", roomId);
  }, [isGameStarted]);

  useEffect(() => {
    if (!roomId || !socket) return;

    socket?.on("deck-shuffled", (data) => {
      setHand(data.hands[playerId] || []);
      setBoards(data.boards || {});
      setCurrentTurn(data.currentTurn);
      setCurrentPhase(data.currentPhase);
    });

    socket?.on("update-game", (data) => {
      setHand(data.hands[playerId] || []);
      setBoards(data.boards || {});
      setCurrentTurn(data.currentTurn);
      setCurrentPhase(data.currentPhase);
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
  }, [currentTurn, currentPhase, playerId]);

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
    handleDraw,
    handleDiscard,
    handleDiscardMultiple,
    handlePlayCard,
    handleEndTurn,
  };
}
