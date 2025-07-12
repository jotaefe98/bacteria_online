import "./Lobby.css";
import { useState } from "react";
import { useCreateRoom } from "../../hooks/looby/useCreateRoom";
import { useSounds } from "../../context/SoundContext";

function Lobby() {
  const [roomCode, setRoomCode] = useState("");
  const { createRoom, existingRoom, isCreatingRoom, isJoiningRoom } =
    useCreateRoom();
  const {  initializeAudio } =
    useSounds();



  const handleCreateRoom = () => {
    initializeAudio(); // Inicializar audio en primera interacción
    createRoom();
  };

  const handleJoinRoom = () => {
    initializeAudio(); // Inicializar audio en primera interacción
    existingRoom(roomCode);
  };

  return (
    <div className="lobby-container">
      <div className="lobby-header">
        <div className="logo">
          <span className="bacteria-icon">🦠</span>
          <h1>Bacteria!</h1>
        </div>
        <p className="subtitle">The Ultimate Card Battle Game</p>
      </div>

      <div className="lobby-content">
        <div className="welcome-section">
          <h2>Welcome to the Bacteria Online Experience</h2>
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
            <button
              className="primary-button"
              onClick={handleCreateRoom}
              disabled={isCreatingRoom}
            >
              {isCreatingRoom ? (
                <>
                  <span className="loading-spinner"></span>
                  Creating Room...
                </>
              ) : (
                "Create Room"
              )}
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
                maxLength={5}
              />
              <button
                className="secondary-button"
                onClick={handleJoinRoom}
                disabled={!roomCode.trim() || isJoiningRoom}
              >
                {isJoiningRoom ? (
                  <>
                    <span className="loading-spinner"></span>
                    Joining...
                  </>
                ) : (
                  "Join Room"
                )}
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
              <span>Attack with bacteria</span>
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
