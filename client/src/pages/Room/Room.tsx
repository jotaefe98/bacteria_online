import { useParams, useNavigate } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import { io, Socket } from "socket.io-client";
import { SOCKET_SERVER_URL } from "../../const/const";
import { nanoid } from "nanoid";
import type { PlayersUpdate } from "../../interfaces/server/server_interfaces";

function Room() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const socketRef = useRef<Socket | null>(null);
  const [players, setPlayers] = useState<string[]>([]);
  const [isHost, setIsHost] = useState(false);
  const [nickname, setNickname] = useState<string>(
    () => localStorage.getItem("nickname") || ""
  );
  const [mostrarSala, setMostrarSala] = useState(!!nickname); 

  const [tempNickname, setTempNickname] = useState<string>("");

  useEffect(() => {
    let playerId: string | null = localStorage.getItem("playerId");

    if (!playerId) {
      playerId = nanoid(12);
      localStorage.setItem("playerId", playerId);
    }


    if (!mostrarSala) return;

    socketRef.current = io(SOCKET_SERVER_URL);

    socketRef.current.emit("join-room", { roomId, playerId, nickname });

    socketRef.current.on("players-update", (playerList: PlayersUpdate[]) => {
      const nicknames = playerList.map((p) => p.nickname);
      setPlayers(nicknames);

      const me = playerList.find((p) => p.playerId === playerId);
      if (!!me?.isHost) setIsHost(true);
    });

    socketRef.current.on("force-disconnect", () => {
      socketRef.current?.disconnect();
      socketRef.current = null;
      navigate("/");
    });

    return () => {
      socketRef.current?.disconnect();
      socketRef.current = null;
    };
  }, [roomId, mostrarSala]);

  useEffect(()=>{
    if(socketRef.current){
     socketRef.current.emit("update-nickname", { roomId, nickname });
    }
  },[nickname]);

  const startGame = () => {
    socketRef.current?.emit("start-game", roomId);
  };

  // Si no hay nickname, pedirlo antes de entrar a la sala
  if (!mostrarSala) {
    return (
      <div className="room">
        <h2>Introduce tu nickname para entrar a la sala</h2>
        <input
          type="text"
          placeholder="Tu nickname"
          value={tempNickname}
          onChange={(e) => setTempNickname(e.target.value)}
        />
        <button
          onClick={() => {
            if (tempNickname.trim()) {
              localStorage.setItem("nickname", tempNickname.trim());
              setNickname(tempNickname.trim());
              setMostrarSala(true);
            }
          }}
        >
          Entrar
        </button>
      </div>
    );
  }

  return (
    <div className="room">
      <h1>Room</h1>
      <p>This is the room with id: {roomId}.</p>
      <p>Your nickname: {nickname}</p>
      <input
        type="text"
        placeholder="Cambiar nickname"
        value={tempNickname}
        onChange={(e) => setTempNickname(e.target.value)}
        style={{ marginRight: "8px" }}
      />
      <button
        onClick={() => {
          if (tempNickname.trim()) {
            localStorage.setItem("nickname", tempNickname.trim());
            setNickname(tempNickname.trim());
            setTempNickname("");
          }
        }}
        disabled={!tempNickname.trim()}
      >
        Cambiar
      </button>
      {isHost && <p>You are the host</p>}
      <h2>Players in room:</h2>
      <ul>
        {players.map((player, idx) => (
          <li key={idx}>{player}</li>
        ))}
      </ul>
      {isHost ? (
        <p>You can start the game.</p>
      ) : (
        <p>Waiting for the host to start the game...</p>
      )}

      {isHost && <button onClick={startGame}>Start Game</button>}

      <button
        onClick={() => {
          socketRef.current?.disconnect();
          socketRef.current = null;
          localStorage.removeItem("currentRoomId");
          navigate("/");
        }}
      >
        Salir de la sala
      </button>
    </div>
  );
}

export default Room;
