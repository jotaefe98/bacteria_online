import { useCallback, useRef, useState } from "react";
import type { Socket } from "socket.io-client";
import type { GameState } from "../../interfaces/game/gameInterfaces";

type UseGameSocketProps = {
  roomId: string | undefined;
};

export function useGame({ roomId }: UseGameSocketProps) {
  const socketRef = useRef<Socket | null>(null);
  const [isGameStarted, setIsGameStarted] = useState(false);
  
  const startGame = useCallback(() => {
    if (socketRef.current) {
      console.log("Starting game in room:", roomId);
      socketRef.current.emit("start-game", roomId);
    }
  }, [roomId]);

  socketRef.current?.on(
    "game-started",
    (isStarted: boolean, log: string, gameStatus: GameState) => {
      console.log("Game started:", isStarted);

      if (isStarted) {
        console.log("Game status:", JSON.stringify(gameStatus, null, 2));
        setIsGameStarted(isStarted);
        //TODO: Algo se hara aqui
      } else {
        alert(`Cannot start game: ${log}`);
      }
    }
  );

  return {
    startGame,
    isGameStarted,
  };
}
