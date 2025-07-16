import { useEffect, useState, useRef } from "react";
import { customAlphabet } from "nanoid";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "../../context/AppContext";
import toast from "react-hot-toast";

export function useCreateRoom() {
  const navigate = useNavigate();
  const { socket } = useAppContext();
  const [isCreatingRoom, setIsCreatingRoom] = useState(false);
  const [isJoiningRoom, setIsJoiningRoom] = useState(false);

  // Referencias para los temporizadores
  const createRoomTimerRef = useRef<NodeJS.Timeout | null>(null);
  const joinRoomTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    socket?.on("room-created", (roomId: string) => {
      setIsCreatingRoom(false);
      // Limpiar temporizador si existe
      if (createRoomTimerRef.current) {
        clearTimeout(createRoomTimerRef.current);
        createRoomTimerRef.current = null;
      }
      // Limpiar cualquier toast de servidor iniciando
      toast.dismiss("server-starting");
      navigate(`/room/${roomId}`);
    });

    socket?.on("existing-room", (exist: boolean, roomId: string) => {
      setIsJoiningRoom(false);
      // Limpiar temporizador si existe
      if (joinRoomTimerRef.current) {
        clearTimeout(joinRoomTimerRef.current);
        joinRoomTimerRef.current = null;
      }
      // Limpiar cualquier toast de servidor iniciando
      toast.dismiss("server-starting");

      console.log(`Room ${roomId} exists? : ${exist}`);
      if (exist) {
        navigate(`/room/${roomId}`);
      } else {
        alert(`Room ${roomId} does not exist.`);
      }
    });

    return () => {
      socket?.off("room-created");
      socket?.off("existing-room");
      // Limpiar temporizadores al desmontar
      if (createRoomTimerRef.current) {
        clearTimeout(createRoomTimerRef.current);
      }
      if (joinRoomTimerRef.current) {
        clearTimeout(joinRoomTimerRef.current);
      }
    };
  }, [socket]);

  const createRoom = () => {
    if (isCreatingRoom) return;
    setIsCreatingRoom(true);

    // Configurar temporizador para mostrar aviso si tarda más de 2 segundos
    createRoomTimerRef.current = setTimeout(() => {
      toast.loading(
        "🔄 Server is starting up... This may take 30 seconds to 1 minute. Please wait.",
        {
          id: "server-starting",
          duration: 60000, // 1 minuto
          style: {
            background: "#363636",
            color: "#fff",
            borderRadius: "10px",
            padding: "12px 16px",
            boxShadow: "0 8px 20px rgba(0,0,0,0.3)",
            fontSize: "14px",
            fontWeight: "500",
            borderLeft: "4px solid #3B82F6",
          },
        }
      );
    }, 2000);

    const nanoid = customAlphabet("ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789", 5);
    const roomId = nanoid();
    socket?.emit("create-room", roomId);
  };

  const existingRoom = (roomId: string) => {
    if (isJoiningRoom) return;
    setIsJoiningRoom(true);

    // Configurar temporizador para mostrar aviso si tarda más de 2 segundos
    joinRoomTimerRef.current = setTimeout(() => {
      toast.loading(
        "🔄 Server is starting up... This may take 30 seconds to 1 minute. Please wait.",
        {
          id: "server-starting",
          duration: 60000, // 1 minuto
          style: {
            background: "#363636",
            color: "#fff",
            borderRadius: "10px",
            padding: "12px 16px",
            boxShadow: "0 8px 20px rgba(0,0,0,0.3)",
            fontSize: "14px",
            fontWeight: "500",
            borderLeft: "4px solid #3B82F6",
          },
        }
      );
    }, 2000);

    socket?.emit("existing-room", roomId);
  };

  return { createRoom, existingRoom, isCreatingRoom, isJoiningRoom };
}
