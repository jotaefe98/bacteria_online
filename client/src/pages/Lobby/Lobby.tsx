import "./Lobby.css";
import { useState } from "react";
import { useCreateRoom } from "../../hooks/looby/useCreateRoom";

function Lobby() {
  const [roomCode, setRoomCode] = useState("");

  const { createRoom, existingRoom } = useCreateRoom();

  return (
    <div className="lobby">
      <h1>Lobby</h1>
      <p>Welcome to virus online</p>
      <br />
      <br />
      <button onClick={createRoom}>Create a room</button>
      <br />
      <br />
      <input
        type="text"
        placeholder="Room code"
        value={roomCode}
        onChange={(e) => setRoomCode(e.target.value)}
      />
      <button
        onClick={() => {
          existingRoom(roomCode);
        }}
      >
        Join room
      </button>
    </div>
  );
}

export default Lobby;
