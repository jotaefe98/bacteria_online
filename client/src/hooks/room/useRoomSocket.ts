import { useEffect, useRef, useCallback } from "react";
import { io, Socket } from "socket.io-client";
import { SOCKET_SERVER_URL } from "../../const/const";
import type { PlayersUpdate } from "../../interfaces/server/server_interfaces";
import { nanoid } from "nanoid";
import { useNavigate } from "react-router-dom";

type UseRoomSocketProps = {
  roomId: string | undefined;
  nickname: string;
  onPlayersUpdate: (players: PlayersUpdate[]) => void;
};

export function useRoomSocket({
  roomId,
  nickname,
  onPlayersUpdate,
}: UseRoomSocketProps) {
  const socketRef = useRef<Socket | null>(null);
  const navigate = useNavigate();

  console.log("nickname", nickname);

  const updateNickname = useCallback(
    (newNickname: string) => {
      if (socketRef.current && roomId) {
        socketRef.current.emit("update-nickname", {
          roomId,
          nickname: newNickname,
        });
      }
    },
    [roomId]
  );

  const disconect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current?.disconnect();
      socketRef.current = null;
      navigate("/");
    }
  }, [roomId]);

  useEffect(() => {
    console.log("useRoomSocket effect", roomId, nickname);
    let playerId: string | null = localStorage.getItem("playerId");

    if (!playerId) {
      playerId = nanoid(12);
      localStorage.setItem("playerId", playerId);
    }

    console.log("Player ID:", playerId);

    socketRef.current = io(SOCKET_SERVER_URL);

    socketRef.current.emit("join-room", { roomId, playerId, nickname });
    socketRef.current.on("players-update", onPlayersUpdate);
    socketRef.current.on("force-disconnect", disconect);

    return () => {
      socketRef.current?.disconnect();
      socketRef.current = null;
    };
  }, [roomId]);

  return { updateNickname, disconect };
}
