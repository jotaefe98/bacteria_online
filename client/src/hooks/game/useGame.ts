import { use, useCallback, useEffect, useState } from "react";
import type { GameState } from "../../interfaces/game/gameInterfaces";
import { useAppContext } from "../../context/AppContext";

type UseGameSocketProps = {
  roomId: string | undefined;
};

export function useGame({ roomId }: UseGameSocketProps) {
  const { socket } = useAppContext();
  const [isGameStarted, setIsGameStarted] = useState(false);

  const startGame = useCallback(() => {
    if (socket) {
      console.log("Starting game in room:", roomId);
      socket.emit("start-game", roomId);
    }
  }, [roomId, socket]);

  useEffect(() => {
    if (!roomId || !socket) return;

    socket?.on(
      "game-started",
      (isStarted: boolean, log: string, gameStatus: GameState) => {
        console.log("Game started:", isStarted);

        if (isStarted) {
          console.log("Game status:", JSON.stringify(gameStatus, null, 2));
          setIsGameStarted(isStarted);
          //TODO Algo se hara aqui
        } else {
          alert(`Cannot start game: ${log}`);
        }
      }
    );

    return () => {
      socket.off("game-started");
    };
  }, [roomId, socket]);

  return {
    startGame,
    isGameStarted,
  };
}
