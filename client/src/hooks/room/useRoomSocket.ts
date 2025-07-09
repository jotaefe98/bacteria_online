import { useEffect, useCallback, useState } from "react";
import type {
  PlayersUpdate,
  roomSettings,
} from "../../interfaces/server/server_interfaces";
import { useNavigate } from "react-router-dom";
import { usePlayerId } from "../usePlayerId";
import { useAppContext } from "../../context/AppContext";

type UseRoomSocketProps = {
  roomId: string | undefined;
};

export function useRoomSocket({ roomId }: UseRoomSocketProps) {
  const { socket } = useAppContext();
  const navigate = useNavigate();
  const playerId = usePlayerId();
  const [showRoom, setShowRoom] = useState(false);
  const [players, setPlayers] = useState<string[]>([]);
  const [isHost, setIsHost] = useState(false);

  const [minPlayers, setMinPlayers] = useState<number>();
  const [maxPlayers, setMaxPlayers] = useState<number>();
  const [isGameStarted, setIsGameStarted] = useState(false);
  const [nickname, setNickname] = useState<string>(
    () => localStorage.getItem("nickname") || ""
  );
  const [showNicknameInput, setShowNicknameInput] = useState(!nickname);

  const updateNickname = useCallback(
    (newNickname: string) => {
      setNickname(newNickname);
      localStorage.setItem("nickname", newNickname);
      setShowNicknameInput(false);
      if (socket && roomId) {
        socket.emit("update-nickname", {
          roomId,
          nickname: newNickname,
        });
      }
    },
    [roomId, socket]
  );

  const disconect = useCallback(() => {
    if (socket) {
      navigate("/");
    }
  }, [roomId, socket]);

  const onPlayersUpdate = (playerList: PlayersUpdate[]) => {
    setPlayers(playerList.map((p) => p.nickname));
    const me = playerList.find(
      (p) => p.playerId === localStorage.getItem("playerId")
    );
    setIsHost(!!me?.isHost);
  };

  const startGame = useCallback(() => {
    if (socket) {
      console.log("Starting game in room:", roomId);
      socket.emit("start-game", roomId);
    }
  }, [roomId, socket]);

  useEffect(() => {
    if (!roomId || !socket) return;

    console.log("Connecting to room:", roomId);
    socket?.emit("existing-room", roomId, playerId);

    socket?.on("room-settings", (roomSettings: roomSettings) => {
      setMinPlayers(roomSettings.min_players);
      setMaxPlayers(roomSettings.max_players);
    });

    socket.on(
      "existing-room",
      (
        exist: boolean,
        roomId: string,
        roomIsStarted: boolean,
        roomIsFull: boolean,
        isPlayerInRoom: boolean
      ) => {
        if (!exist) {
          alert(`Room ${roomId} does not exist.`);
          navigate("/");
        } else if (roomIsStarted && !isPlayerInRoom) {
          alert(`The game in room ${roomId} has already started.`);
          navigate("/");
        } else if (roomIsFull && !isPlayerInRoom) {
          alert(`Room ${roomId} is full.`);
          navigate("/");
        } else {
          setShowRoom(true);
          socket?.emit("join-room", { roomId, playerId, nickname });
        }
      }
    );
    socket?.on("game-started", (isStarted: boolean, log: string) => {
      console.log("Game started:", isStarted);

      if (isStarted) {
        setIsGameStarted(isStarted);
        //TODO Algo se hara aqui
      } else {
        alert(`Cannot start game: ${log}`);
      }
    });
    socket.on("players-update", onPlayersUpdate);
    socket.on("force-disconnect", disconect);
    return () => {
      socket.off("room-settings");
      socket.off("existing-room");
      socket.off("players-update");
      socket.off("force-disconnect");
      socket.off("game-started");
      socket.emit("leave-room", { roomId, playerId });
    };
  }, [roomId, socket]);

  return {
    updateNickname,
    disconect,
    showRoom,
    nickname,
    showNicknameInput,
    players,
    isHost,
    minPlayers,
    maxPlayers,
    startGame,
    isGameStarted,
  };
}
