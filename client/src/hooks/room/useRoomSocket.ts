import { useEffect, useRef, useCallback, useState } from "react";
import { io, Socket } from "socket.io-client";
import { SOCKET_SERVER_URL } from "../../const/const";
import type { PlayersUpdate, roomSettings } from "../../interfaces/server/server_interfaces";
import { useNavigate } from "react-router-dom";
import { usePlayerId } from "../usePlayerId";

type UseRoomSocketProps = {
  roomId: string | undefined;
};

export function useRoomSocket({ roomId }: UseRoomSocketProps) {
  const socketRef = useRef<Socket | null>(null);
  const navigate = useNavigate();
  const playerId = usePlayerId();
  const [showRoom, setShowRoom] = useState(false);
  const [players, setPlayers] = useState<string[]>([]);
  const [isHost, setIsHost] = useState(false);
  const [isGameStarted, setIsGameStarted] = useState(false);
  const [minPlayers, setMinPlayers] = useState<number>();
  const [maxPlayers, setMaxPlayers] = useState<number>();
  const [nickname, setNickname] = useState<string>(
    () => localStorage.getItem("nickname") || ""
  );
  const [showNicknameInput, setShowNicknameInput] = useState(!nickname);

  console.log("nickname", nickname);

  const updateNickname = useCallback(
    (newNickname: string) => {
      setNickname(newNickname);
      localStorage.setItem("nickname", newNickname);
      setShowNicknameInput(false);
      if (socketRef.current && roomId) {
        socketRef.current.emit("update-nickname", {
          roomId,
          nickname: newNickname,
        });
      }
    },
    [roomId]
  );

  const startGame = useCallback(() => {
    if (socketRef.current) {
      console.log("Starting game in room:", roomId);
      socketRef.current.emit("start-game", roomId);
    }
  }, [roomId]);

  const disconect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current?.disconnect();
      socketRef.current = null;
      navigate("/");
    }
  }, [roomId]);

  const onPlayersUpdate = useCallback((playerList: PlayersUpdate[]) => {
    setPlayers(playerList.map((p) => p.nickname));
    const me = playerList.find(
      (p) => p.playerId === localStorage.getItem("playerId")
    );
    setIsHost(!!me?.isHost);
  }, []);

  useEffect(() => {
    console.log("useRoomSocket effect", roomId, nickname);

    console.log("Player ID:", playerId);

    socketRef.current = io(SOCKET_SERVER_URL);

    socketRef.current?.emit("existing-room", roomId, playerId);

    socketRef.current?.on("room-settings", (roomSettings:roomSettings) => {
      console.log("Room settings received:", roomSettings);
      setMinPlayers(roomSettings.min_players);
      setMaxPlayers(roomSettings.max_players);
    });

    socketRef.current.on(
      "existing-room",
      (
        exist: boolean,
        roomId: string,
        roomIsStarted: boolean,
        roomIsFull: boolean,
        isPlayerInRoom: boolean
      ) => {
        console.log(`Room ${roomId} exists? : ${exist}`);
        if (!exist) {
          alert(`Room ${roomId} does not exist.`);
          navigate("/");
        }else if (roomIsStarted && !isPlayerInRoom) {
          alert(`The game in room ${roomId} has already started.`);
          navigate("/");
        } else if (roomIsFull && !isPlayerInRoom) {
          alert(`Room ${roomId} is full.`);
          navigate("/");
        } else {
          setShowRoom(true);
          socketRef.current?.emit("join-room", { roomId, playerId, nickname });
        }
      }
    );

    socketRef.current?.on("game-started", (isStarted: boolean, log: string) => {
      console.log("Game started:", isStarted);
      
      if (isStarted) {
        setIsGameStarted(isStarted);
        //TODO: Algo se hara aqui
      }else{
        alert(`Cannot start game: ${log}`);
      }

    });

    socketRef.current.on("players-update", onPlayersUpdate);
    socketRef.current.on("force-disconnect", disconect);

    return () => {
      socketRef.current?.disconnect();
      socketRef.current = null;
    };
  }, [roomId]);

  return {
    updateNickname,
    disconect,
    startGame,
    showRoom,
    nickname,
    showNicknameInput,
    players,
    isHost,
    isGameStarted,
    minPlayers,
    maxPlayers,
  };
}
