import { useParams } from "react-router-dom";
import { useState } from "react";
import { useRoomSocket } from "../../hooks/room/useRoomSocket";
import PlayerList from "../../components/PlayerList/PlayerList";
import InsertNickname from "../../components/PlayerList/InsertNickname";
import { Game } from "../../components/Game/Game";
import "./Room.css";

function Room() {
  const { roomId } = useParams();
  const [tempNickname, setTempNickname] = useState<string>("");

  const {
    updateNickname,
    disconect,
    startGame,
    showRoom,
    nickname,
    showNicknameInput,
    players,
    isHost,
    maxPlayers,
    isGameStarted,
  } = useRoomSocket({
    roomId,
  });

  if (!showRoom) {
    return (
      <div className="loading-container">
        <div className="loading-spinner">
          <div className="virus-spinner">🦠</div>
        </div>
        <p>Loading room...</p>
      </div>
    );
  }

  // If there is no nickname, show the input to enter it
  if (showNicknameInput) {
    return <InsertNickname onNicknameSubmit={updateNickname} />;
  }

  if (isGameStarted) {
    return (
      <Game
        roomId={roomId!}
        isGameStarted={isGameStarted}
        onLeaveRoom={disconect}
        isHost={isHost}
      />
    );
  }

  return (
    <div className="room-container">
      <div className="room-header">
        <div className="room-title">
          <h1>🦠 Virus! Room</h1>
          <div className="room-code">
            <span className="code-label">Room Code:</span>
            <span className="code-value">{roomId}</span>
          </div>
        </div>

        {isHost && (
          <div className="host-badge">
            <span className="crown-icon">👑</span>
            <span>Host</span>
          </div>
        )}
      </div>

      <div className="room-content">
        <div className="player-section">
          <div className="section-header">
            <h2>Players in Room</h2>
            <div className="player-count">
              {players?.length}/{maxPlayers}
            </div>
          </div>
          <PlayerList players={players} />
        </div>

        <div className="player-info-section">
          <div className="current-player-info">
            <h3>Your Profile</h3>
            <div className="nickname-display">
              <span className="player-icon">👤</span>
              <span className="current-nickname">{nickname}</span>
            </div>

            <div className="nickname-changer">
              <input
                type="text"
                placeholder="Change nickname"
                value={tempNickname}
                onChange={(e) => setTempNickname(e.target.value)}
                className="nickname-input"
                maxLength={20}
              />
              <button
                className="change-btn"
                onClick={() => {
                  if (tempNickname.trim()) {
                    localStorage.setItem("nickname", tempNickname.trim());
                    updateNickname(tempNickname.trim());
                    setTempNickname("");
                  }
                }}
                disabled={!tempNickname.trim()}
              >
                Update
              </button>
            </div>
          </div>

          <div className="game-status">
            {isHost ? (
              <div className="host-controls">
                <h3>Game Controls</h3>
                <p className="status-text">
                  You can start the game when ready!
                </p>
                <button
                  className="start-game-btn"
                  onClick={startGame}
                  disabled={players?.length < 2}
                >
                  🎮 Start Game
                </button>
                {players?.length < 2 && (
                  <p className="warning-text">
                    Need at least 2 players to start
                  </p>
                )}
              </div>
            ) : (
              <div className="waiting-area">
                <h3>Waiting for Game</h3>
                <div className="waiting-animation">
                  <div className="waiting-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
                <p className="status-text">
                  Waiting for the host to start the game...
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="room-footer">
        <button className="leave-btn" onClick={disconect}>
          🚪 Leave Room
        </button>
      </div>
    </div>
  );
}

export default Room;
