import { useEffect } from "react";
import { useAppContext } from "../../context/AppContext";

type UseGameSocketProps = {
  roomId: string | undefined;
};

export function useGame({ roomId }: UseGameSocketProps) {
  const { socket } = useAppContext();

  useEffect(() => {
    if (!roomId || !socket) return;

    return () => {};
  }, [roomId, socket]);

  return {};
}
