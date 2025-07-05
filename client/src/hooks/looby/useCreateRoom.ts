import { useRef, useCallback, useEffect } from "react";
import { io, Socket } from "socket.io-client";
import { SOCKET_SERVER_URL } from "../../const/const";
import { customAlphabet } from "nanoid";
import { useNavigate } from "react-router-dom";

export function useCreateRoom() {
  const navigate = useNavigate();
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    socketRef.current = io(SOCKET_SERVER_URL);

    socketRef.current.on("room-created", (roomId: string) => {
      navigate(`/room/${roomId}`);
    });

    return () => {
      socketRef.current?.disconnect();
      socketRef.current = null;
    };
  }, []);

  const createRoom = () => {
    const nanoid = customAlphabet("ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789", 6);
    const roomId = nanoid();
    socketRef.current?.emit("create-room", roomId);
    
  };

  const existingRoom = useCallback((roomId: string) => {}, []);

  return { createRoom, existingRoom };
}
