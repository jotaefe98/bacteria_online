import { useEffect, useRef, useCallback } from "react";
import { io, Socket } from "socket.io-client";
import { SOCKET_SERVER_URL } from "../../const/const";
import type { PlayersUpdate } from "../../interfaces/server/server_interfaces";
import { useNavigate } from "react-router-dom";
import { usePlayerId } from "../usePlayerId";

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
  const playerId = usePlayerId();

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
