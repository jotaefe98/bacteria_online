import { useEffect } from "react";
import { customAlphabet } from "nanoid";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "../../context/AppContext";

export function useCreateRoom() {
  const navigate = useNavigate();
  const { socket } = useAppContext();

  useEffect(() => {
    socket?.on("room-created", (roomId: string) => {
      navigate(`/room/${roomId}`);
    });

    socket?.on("existing-room", (exist: boolean, roomId: string) => {
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
    const nanoid = customAlphabet("ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789", 6);
    const roomId = nanoid();
    socket?.emit("create-room", roomId);
  };

  const existingRoom = (roomId: string) => {
    socket?.emit("existing-room", roomId);
  };

  return { createRoom, existingRoom };
}
