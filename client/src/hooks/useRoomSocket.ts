import { useEffect, useRef, useCallback, use } from "react";
import { io, Socket } from "socket.io-client";
import { SOCKET_SERVER_URL } from "../const/const";
import type { PlayersUpdate } from "../interfaces/server/server_interfaces";

type UseRoomSocketProps = {
  roomId: string | undefined;
  nickname: string;
  onPlayersUpdate: (players: PlayersUpdate[]) => void;
  onForceDisconnect: () => void;
};

export function useRoomSocket({roomId, nickname}:{ roomId: string; nickname: string }){
  const socketRef = useRef<Socket | null>(null);

  console.log("useRoomSocket", roomId, nickname);

  useEffect(() => {
    socketRef.current = io(SOCKET_SERVER_URL);

    

    return () => {
      socketRef.current?.disconnect();
      socketRef.current = null;
    }
  }, []);
}

export function useRoomSocketTST({
  roomId,
  nickname,
  onPlayersUpdate,
  onForceDisconnect,
}: UseRoomSocketProps) {
  const socketRef = useRef<Socket | null>(null);

  // Conexión y eventos
  useEffect(() => {
    if (!roomId || !nickname) return;

    const playerId =
      localStorage.getItem("playerId") ||
      (() => {
        const id = crypto.randomUUID();
        localStorage.setItem("playerId", id);
        return id;
      })();

    socketRef.current = io(SOCKET_SERVER_URL);

    socketRef.current.emit("join-room", { roomId, playerId, nickname });

    socketRef.current.on("players-update", onPlayersUpdate);
    socketRef.current.on("force-disconnect", onForceDisconnect);

    return () => {
      socketRef.current?.disconnect();
      socketRef.current = null;
    };
  }, [roomId, nickname, onPlayersUpdate, onForceDisconnect]);

  // Cambiar nickname
  const updateNickname = useCallback(
    (newNickname: string) => {
      if (socketRef.current && roomId) {
        socketRef.current.emit("update-nickname", { roomId, nickname: newNickname });
      }
    },
    [roomId]
  );

  // Iniciar juego
  const startGame = useCallback(() => {
    if (socketRef.current && roomId) {
      socketRef.current.emit("start-game", roomId);
    }
  }, [roomId]);

  // Salir de la sala
  const leaveRoom = useCallback(() => {
    socketRef.current?.disconnect();
    socketRef.current = null;
  }, []);

  return { updateNickname, startGame, leaveRoom };
}