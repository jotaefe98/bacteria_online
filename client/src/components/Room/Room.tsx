import { useParams, useNavigate } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import { io, Socket } from "socket.io-client";
import { SOCKET_SERVER_URL } from "../../const/const";
import { nanoid } from "nanoid";

function Room() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const socketRef = useRef<Socket | null>(null);
  const [players, setPlayers] = useState<string[]>([]);
  const [isHost, setIsHost] = useState(false);
  const [nickname, setNickname] = useState<string>(
    () => localStorage.getItem("nickname") || ""
  );
  const [tempNickname, setTempNickname] = useState<string>("");

  useEffect(() => {
    let playerId: string | null = localStorage.getItem("playerId");

    if (!playerId) {
      playerId = nanoid(12);
      localStorage.setItem("playerId", playerId);
    }

    // Solo conectar si hay nickname
    if (!nickname) return;

    socketRef.current = io(SOCKET_SERVER_URL);

    socketRef.current.emit("join-room", { roomId, playerId, nickname });

    socketRef.current.on("players-update", (playerList: string[]) => {
      setPlayers(playerList);
    });

    return () => {
      socketRef.current?.disconnect();
      socketRef.current = null;
    };
  }, [roomId, nickname]);

  // TODO: This should be handled in the backend
  useEffect(() => {
    if (players.length <= 1 && !isHost) {
      setIsHost(true);
    }
  }, [players, isHost]);

  const startGame = () => {
    socketRef.current?.emit("start-game", roomId);
  };

  // Si no hay nickname, pedirlo antes de entrar a la sala
  if (!nickname) {
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
      <h2>Players in room:</h2>
      <ul>
        {players.map((player, idx) => (
          <li key={idx}>{player}</li>
        ))}
      </ul>
      {isHost && <button onClick={startGame}>Start Game</button>}
      <p>Esperando a que todos los jugadores se conecten...</p>
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
