import { useParams } from "react-router-dom";
import { useState } from "react";
import { useRoomSocket } from "../../hooks/useRoomSocket";

function Room() {
  const { roomId } = useParams();
  const [players, setPlayers] = useState<string[]>([]);
  const [isHost, setIsHost] = useState(false);
  const [nickname, setNickname] = useState<string>(
    () => localStorage.getItem("nickname") || ""
  );
  const [mostrarSala, setMostrarSala] = useState(!!nickname);

  const [tempNickname, setTempNickname] = useState<string>("");

  const { updateNickname,disconect } = useRoomSocket({
    roomId: roomId,
    nickname,
    onPlayersUpdate: (playerList) => {
      setPlayers(playerList.map((p) => p.nickname));
      const me = playerList.find(
        (p) => p.playerId === localStorage.getItem("playerId")
      );
      setIsHost(!!me?.isHost);
    }
  });

  const startGame = () => {
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
              updateNickname(tempNickname.trim());
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
            updateNickname(tempNickname.trim());
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
          disconect();
        }}
      >
        Salir de la sala
      </button>
    </div>
  );
}

export default Room;
