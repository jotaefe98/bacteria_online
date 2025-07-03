import { customAlphabet } from "nanoid";
import { useNavigate } from "react-router-dom";

import "./Lobby.css";
import { useState } from "react";

const nanoid = customAlphabet("ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789", 6);

function Lobby() {
  const navigate = useNavigate();
  const [roomCode, setRoomCode] = useState('');
  /**
   *
   * createRoom function generates a unique room ID and navigates to the room page.
   * It uses the nanoid library to create a random ID of length 6
   *
   */
  const createRoom = () => {
    const roomId = nanoid();
    console.log(`Room created with ID: ${roomId}`);
    navigate(`/room/${roomId}`);
  };

  //TODO: Check if there is a room with this roomId
  const joinRoom = () => {
    console.log(`Joining room with ID: ${roomCode}`);
    navigate(`/room/${roomCode}`);
  };

  return (
    <div className="lobby">
      <h1>Lobby</h1>
      <p>Welcome to virus online</p>
      <br />
      <br />
      <button onClick={createRoom}>Create a room</button>
      <br />
      <br />
      <input type="text" placeholder="Room code" value={roomCode} onChange={e => setRoomCode(e.target.value)} />
      <button onClick={joinRoom}>Join room</button>
    </div>
  );
}

export default Lobby;
