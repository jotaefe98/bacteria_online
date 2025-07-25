import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { useRoomSocket } from "../../hooks/room/useRoomSocket";
import { useBeforeUnload } from "../../hooks/useBeforeUnload";
import { usePlayerId } from "../../hooks/usePlayerId";
import { useAppContext } from "../../context/AppContext";
import PlayerList from "../../components/PlayerList/PlayerList";
import InsertNickname from "../../components/PlayerList/InsertNickname";
import { Game } from "../../components/Game/Game";
import { validateNickname } from "../../utils/validation";
import toast from "react-hot-toast";
import { copyToClipboard, generateRoomLink } from "../../utils/clipboardUtils";
import "./Room.css";

function Room() {
  const { roomId } = useParams();
  const [tempNickname, setTempNickname] = useState<string>("");
  const [isReconnecting, setIsReconnecting] = useState(false);

  // Get socket and playerId for beforeunload hook
  const { socket } = useAppContext();
  const playerId = usePlayerId();

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
    minPlayers,
    isGameStarted,
  } = useRoomSocket({
    roomId,
  });

  // Hook to detect browser close and disconnect user
  useBeforeUnload({
    socket,
    roomId,
    playerId,
  });

  useEffect(() => {
    // Check if we're reconnecting to a saved game session
    const savedRoomId = localStorage.getItem("currentRoomId");
    const savedGameState = localStorage.getItem("gameStarted");

    if (savedRoomId === roomId && savedGameState === "true") {
      setIsReconnecting(true);
      // Clear reconnecting state after a reasonable time
      setTimeout(() => {
        setIsReconnecting(false);
      }, 3000);
    }
  }, [roomId]);

  const copyRoomCode = async () => {
    const success = await copyToClipboard(
      roomId!,
      "Room code copied to clipboard!",
      "Failed to copy room code"
    );
    if (success) {
      toast.success("Room code copied to clipboard!", { duration: 2000 });
    } else {
      toast.error("Failed to copy room code", { duration: 2000 });
    }
  };

  const copyRoomLink = async () => {
    const roomLink = generateRoomLink(roomId!);
    const success = await copyToClipboard(
      roomLink,
      "Room link copied to clipboard!",
      "Failed to copy room link"
    );
    if (success) {
      toast.success("Room link copied to clipboard!", { duration: 2000 });
    } else {
      toast.error("Failed to copy room link", { duration: 2000 });
    }
  };

  if (!showRoom) {
    return (
      <div className="loading-container">
        <div className="loading-spinner">
          <div className="bacteria-spinner">🦠</div>
        </div>
        <p>
          {isReconnecting ? "Reconnecting to your game..." : "Loading room..."}
        </p>
      </div>
    );
  }

  // If there is no nickname, show the input to enter it
  if (showNicknameInput) {
    return <InsertNickname onNicknameSubmit={updateNickname} />;
  }

  if (isGameStarted) {
    return (
      <Game roomId={roomId!} isGameStarted={isGameStarted} isHost={isHost} />
    );
  }

  return (
    <div className="room-container">
      <div className="room-header">
        <div className="room-title">
          <h1>🦠 Bacteria! Room</h1>
          <div className="room-code-section">
            <div className="room-code">
              <span className="code-label">Room Code:</span>
              <span className="code-value">{roomId}</span>
            </div>
            <div className="copy-buttons">
              <button
                className="copy-btn code-copy"
                onClick={copyRoomCode}
                title="Copy room code"
              >
                📋 Copy Code
              </button>
              <button
                className="copy-btn link-copy"
                onClick={copyRoomLink}
                title="Copy room link"
              >
                🔗 Copy Link
              </button>
            </div>
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
                onChange={(e) => setTempNickname(e.target.value.slice(0, 20))}
                className="nickname-input"
                maxLength={20}
              />
              <button
                className="change-btn"
                onClick={() => {
                  const trimmedNickname = tempNickname.trim();

                  if (!trimmedNickname) {
                    toast.error("Please enter a nickname");
                    return;
                  }

                  if (trimmedNickname === nickname) {
                    toast("This is already your current nickname", {
                      icon: "ℹ️",
                    });
                    setTempNickname("");
                    return;
                  }

                  const validation = validateNickname(trimmedNickname);
                  if (!validation.isValid) {
                    toast.error(validation.error!);
                    return;
                  }

                  localStorage.setItem("nickname", trimmedNickname);
                  updateNickname(trimmedNickname);
                  setTempNickname("");
                  toast.success("Nickname updated!");
                }}
                disabled={
                  !tempNickname.trim() || tempNickname.trim() === nickname
                }
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
                  disabled={players?.length < minPlayers}
                >
                  🎮 Start Game
                </button>
                {players?.length < minPlayers && (
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
