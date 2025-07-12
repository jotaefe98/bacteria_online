import { useEffect, useState } from "react";
import { customAlphabet } from "nanoid";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "../../context/AppContext";

export function useCreateRoom() {
  const navigate = useNavigate();
  const { socket } = useAppContext();
  const [isCreatingRoom, setIsCreatingRoom] = useState(false);
  const [isJoiningRoom, setIsJoiningRoom] = useState(false);

  useEffect(() => {
    socket?.on("room-created", (roomId: string) => {
      setIsCreatingRoom(false);
      navigate(`/room/${roomId}`);
    });

    socket?.on("existing-room", (exist: boolean, roomId: string) => {
      setIsJoiningRoom(false);
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
    };
  }, [socket]);

  const createRoom = () => {
    if (isCreatingRoom) return;
    setIsCreatingRoom(true);
    const nanoid = customAlphabet("ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789", 5);
    const roomId = nanoid();
    socket?.emit("create-room", roomId);
  };

  const existingRoom = (roomId: string) => {
    if (isJoiningRoom) return;
    setIsJoiningRoom(true);
    socket?.emit("existing-room", roomId);
  };

  return { createRoom, existingRoom, isCreatingRoom, isJoiningRoom };
}
