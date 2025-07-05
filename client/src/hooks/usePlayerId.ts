import { useRef } from "react";
import { nanoid } from "nanoid";

export function usePlayerId() {
  const playerIdRef = useRef<string>("");

  if (!playerIdRef.current) {
    let playerId = localStorage.getItem("playerId");
    if (!playerId) {
      playerId = nanoid(12);
      localStorage.setItem("playerId", playerId);
    }
    playerIdRef.current = playerId;
  }

  return playerIdRef.current;
}
