import { useParams } from "react-router-dom";
import { useState } from "react";
import { useRoomSocket } from "../../hooks/room/useRoomSocket";
import PlayerList from "../../components/PlayerList/PlayerList";
import InsertNickname from "../../components/PlayerList/InsertNickname";
import { Game } from "../../components/Game/Game";
import { useGame } from "../../hooks/game/useGame";


function Room() {
  const { roomId } = useParams();
  //const socketRef = useRef<Socket | null>(null);

  const [tempNickname, setTempNickname] = useState<string>("");

  const {
    updateNickname,
    disconect,
    showRoom,
    nickname,
    showNicknameInput,
    players,
    isHost,
    maxPlayers,
  } = useRoomSocket({
    roomId,
  });

  const { startGame, isGameStarted } = useGame({ roomId });

  if (!showRoom) {
    return <div>Loading...</div>;
  }

  // If there is no nickname, show the input to enter it
  if (showNicknameInput) {
    return (
      <>
        <InsertNickname onNicknameSubmit={updateNickname} />
      </>
    );
  }

  if (isGameStarted) {
    return (
      <>
        <Game onLeaveRoom={disconect} />
      </>
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
            updateNickname(tempNickname.trim());
            setTempNickname("");
          }
        }}
        disabled={!tempNickname.trim()}
      >
        Cambiar
      </button>
      {isHost && <p>You are the host</p>}
      <h2>
        Players in room: ({players?.length}/{maxPlayers}){" "}
      </h2>
      {<PlayerList players={players} />}
      {isHost ? (
        <p>You can start the game.</p>
      ) : (
        <p>Waiting for the host to start the game...</p>
      )}

      {isHost && <button onClick={startGame}>Start Game</button>}

      <button
        onClick={() => {
          console.log("se llama al boton");
          disconect();
        }}
      >
        Salir de la sala
      </button>
    </div>
  );
}

export default Room;
