import "./Lobby.css";
import { useState } from "react";
import { useCreateRoom } from "../../hooks/looby/useCreateRoom";

function Lobby() {
  const [roomCode, setRoomCode] = useState("");
  const { createRoom, existingRoom } = useCreateRoom();

  return (
    <div className="lobby-container">
      <div className="lobby-header">
        <div className="logo">
          <span className="virus-icon">🦠</span>
          <h1>Virus!</h1>
        </div>
        <p className="subtitle">The Ultimate Card Battle Game</p>
      </div>

      <div className="lobby-content">
        <div className="welcome-section">
          <h2>Welcome to the Virus Online Experience</h2>
          <p>
            Challenge your friends in this exciting card game where strategy
            meets chaos!
          </p>
        </div>

        <div className="action-cards">
          <div className="action-card create-room">
            <div className="card-icon">🎮</div>
            <h3>Create New Room</h3>
            <p>Start a new game and invite your friends</p>
            <button className="primary-button" onClick={createRoom}>
              Create Room
            </button>
          </div>

          <div className="action-card join-room">
            <div className="card-icon">🚪</div>
            <h3>Join Existing Room</h3>
            <p>Enter a room code to join your friends</p>
            <div className="join-form">
              <input
                type="text"
                placeholder="Enter room code"
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                className="room-input"
                maxLength={6}
              />
              <button
                className="secondary-button"
                onClick={() => existingRoom(roomCode)}
                disabled={!roomCode.trim()}
              >
                Join Room
              </button>
            </div>
          </div>
        </div>

        <div className="game-info">
          <h3>How to Play</h3>
          <div className="info-grid">
            <div className="info-item">
              <span className="info-icon">🫀</span>
              <span>Collect 4 healthy organs</span>
            </div>
            <div className="info-item">
              <span className="info-icon">🦠</span>
              <span>Attack with viruses</span>
            </div>
            <div className="info-item">
              <span className="info-icon">💉</span>
              <span>Defend with medicines</span>
            </div>
            <div className="info-item">
              <span className="info-icon">🧪</span>
              <span>Use special treatments</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Lobby;
