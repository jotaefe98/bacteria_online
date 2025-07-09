import {  useEffect, useState } from "react";
import { useAppContext } from "../../context/AppContext";
import type { Card } from "../../interfaces/game/gameInterfaces";
import { usePlayerId } from "../usePlayerId";

type UseGameSocketProps = {
  roomId: string | undefined;
  isGameStarted: boolean;
  isHost: boolean;
};

export function useGame({ roomId, isGameStarted,isHost }: UseGameSocketProps) {
  const { socket } = useAppContext();
  const playerId = usePlayerId();
  const [hand, setHand] = useState<Card[]>([]);
  const [currentTurn, setCurrentTurn] = useState<string>("");

  const [canDraw, setCanDraw] = useState(false);

  useEffect(() => {
    if (!isGameStarted || !socket || !isHost) return;
    console.log("Game started, shuffling deck...");
    socket.emit("shuffle-deck", roomId);
  }, [isGameStarted]);



  useEffect(() => {
    if (!roomId || !socket) return;
    socket?.on("deck-shuffled", (data) => {
      setHand(data.hands[playerId] || []);
      setCurrentTurn(data.currentTurn);
    });

    socket?.on("update-game", (data) => {
      setHand(data.hands[playerId] || []);
      setCurrentTurn(data.currentTurn);
    });

    return () => {
      socket?.off("deck-shuffled");
      socket?.off("update-game");
    };
  }, [roomId, socket]);




  useEffect(() => {
    setCanDraw(currentTurn === playerId);
  }, [currentTurn]);

  const handleDraw = () => {
    if (socket && canDraw) {
      socket.emit("draw-card", roomId);
    }
  };

  const handleDiscard = (cardId: string) => {
    if (socket && canDraw) {
      socket.emit("discard-card", roomId, cardId);
    }
  };

  return {hand,handleDraw, handleDiscard, currentTurn, canDraw, playerId};
}
