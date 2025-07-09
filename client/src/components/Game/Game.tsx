import { useState } from "react";
import { useGame } from "../../hooks/game/useGame";
import { Board } from "../Board/Board";
import Card from "../Card/Card";
import type { PlayCardAction } from "../../interfaces/game/gameInterfaces";
import "./Game.css";

type GameProps = {
  roomId: string;
  isGameStarted: boolean;
  isHost: boolean;
  onLeaveRoom: () => void;
};

export function Game({
  roomId,
  isGameStarted,
  onLeaveRoom,
  isHost,
}: GameProps) {
  const {
    hand,
    boards,
    currentTurn,
    currentPhase,
    winner,
    gameError,
    canDraw,
    canPlay,
    canEndTurn,
    playerId,
    handleDraw,
    handleDiscard,
    handleDiscardMultiple,
    handlePlayCard,
    handleEndTurn,
  } = useGame({ roomId, isGameStarted, isHost });

  const [selectedCards, setSelectedCards] = useState<string[]>([]);
  const [selectedTarget, setSelectedTarget] = useState<{
    playerId?: string;
    organColor?: string;
  }>({});
  const [playMode, setPlayMode] = useState<"single" | "multiple">("single");

  const toggleCardSelection = (cardId: string) => {
    if (playMode === "single") {
      setSelectedCards([cardId]);
    } else {
      setSelectedCards((prev) =>
        prev.includes(cardId)
          ? prev.filter((id) => id !== cardId)
          : [...prev, cardId]
      );
    }
  };

  const handlePlaySelectedCard = () => {
    if (selectedCards.length !== 1) return;

    const cardId = selectedCards[0];
    const card = hand.find((c) => c.id === cardId);
    if (!card) return;

    const action: PlayCardAction = {
      cardId,
      targetPlayerId: selectedTarget.playerId,
      targetOrganColor: selectedTarget.organColor,
    };

    handlePlayCard(action);
    setSelectedCards([]);
    setSelectedTarget({});
  };

  const handleDiscardSelected = () => {
    if (selectedCards.length === 0) return;

    if (selectedCards.length === 1) {
      handleDiscard(selectedCards[0]);
    } else {
      handleDiscardMultiple(selectedCards);
    }

    setSelectedCards([]);
  };

  const handleOrganClick = (organPlayerId: string, organColor: string) => {
    setSelectedTarget({ playerId: organPlayerId, organColor });
  };

  const getPhaseText = () => {
    switch (currentPhase) {
      case "play_or_discard":
        return "Play card or discard";
      case "draw":
        return "Draw cards";
      case "end_turn":
        return "End turn";
      default:
        return currentPhase;
    }
  };

  if (winner) {
    return (
      <div className="game-container">
        <div className="victory-screen">
          <div className="victory-content">
            <h1 className="victory-title">🎉 GAME OVER! 🎉</h1>
            <div className="victory-message">
              {winner === playerId ? (
                <>
                  <div className="winner-badge">🏆 VICTORY! 🏆</div>
                  <p className="winner-text">
                    Congratulations! You have won the game!
                  </p>
                  <div className="celebration">🎊🎈🎁🎈🎊</div>
                </>
              ) : (
                <>
                  <div className="loser-badge">😔 DEFEAT</div>
                  <p className="loser-text">
                    Winner: <strong>{winner}</strong>
                  </p>
                  <p className="encourage-text">Better luck next time!</p>
                </>
              )}
            </div>
            <button onClick={onLeaveRoom} className="victory-button">
              🚪 Leave Room
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="game-container">
      <div className="game-header">
        <h2>🦠 Virus! - Game in Progress</h2>
        <div className="game-info">
          <div className="info-card player-info">
            <strong>Your ID:</strong>
            <span className="player-id">{playerId}</span>
          </div>
          <div
            className={`info-card turn-info ${
              currentTurn === playerId ? "your-turn" : "other-turn"
            }`}
          >
            <strong>Current Turn:</strong>
            <span className="turn-player">
              {currentTurn === playerId ? (
                <>
                  <span className="turn-indicator">🎯</span>
                  Your turn!
                </>
              ) : (
                <>
                  <span className="turn-indicator">⏳</span>
                  {currentTurn}
                </>
              )}
            </span>
          </div>
          <div className="info-card phase-info">
            <strong>Phase:</strong>
            <span className="current-phase">
              <span className="phase-icon">
                {currentPhase === "play_or_discard"
                  ? "🎯"
                  : currentPhase === "draw"
                  ? "🃏"
                  : "⏭"}
              </span>
              {getPhaseText()}
            </span>
          </div>
        </div>
      </div>

      {gameError && <div className="error-message">❌ {gameError}</div>}

      {/* Tableros de todos los jugadores */}
      <div className="boards-container">
        {Object.entries(boards).map(([playerBoardId, board]) => (
          <Board
            key={playerBoardId}
            board={board}
            playerId={playerBoardId}
            isCurrentPlayer={playerBoardId === playerId}
            onOrganClick={(organColor) =>
              handleOrganClick(playerBoardId, organColor)
            }
          />
        ))}
      </div>

      {/* Game controls */}
      <div className="game-controls">
        {canDraw && (
          <button onClick={handleDraw} className="action-button draw-button">
            🃏 Draw Cards
          </button>
        )}

        {canEndTurn && (
          <button
            onClick={handleEndTurn}
            className="action-button end-turn-button"
          >
            ⏭ End Turn
          </button>
        )}
      </div>

      {/* Selected target */}
      {selectedTarget.playerId && selectedTarget.organColor && (
        <div className="target-info">
          <div className="target-icon">🎯</div>
          <div className="target-details">
            <strong>Target Selected:</strong>
            <span className="target-description">
              <span className="target-organ">
                {selectedTarget.organColor.toUpperCase()}
              </span>
              organ from{" "}
              <span className="target-player">
                {selectedTarget.playerId === playerId
                  ? "yourself"
                  : selectedTarget.playerId}
              </span>
            </span>
          </div>
          <button
            className="clear-target-btn"
            onClick={() => setSelectedTarget({})}
            title="Clear target selection"
          >
            ✖
          </button>
        </div>
      )}

      {/* Your hand */}
      <div className="hand-section">
        <div className="hand-header">
          <h3>Your Hand ({hand.length} cards)</h3>
          <div className="play-mode-selector">
            <label>
              <input
                type="radio"
                value="single"
                checked={playMode === "single"}
                onChange={() => setPlayMode("single")}
              />
              Play one card
            </label>
            <label>
              <input
                type="radio"
                value="multiple"
                checked={playMode === "multiple"}
                onChange={() => setPlayMode("multiple")}
              />
              Discard multiple
            </label>
          </div>
        </div>

        <div className="hand-container">
          {hand.map((card) => (
            <Card
              key={card.id}
              card={card}
              isSelected={selectedCards.includes(card.id)}
              onClick={() => canPlay && toggleCardSelection(card.id)}
              disabled={!canPlay}
            />
          ))}
        </div>

        {canPlay && selectedCards.length > 0 && (
          <div className="hand-actions">
            {playMode === "single" && selectedCards.length === 1 && (
              <button
                onClick={handlePlaySelectedCard}
                className="action-button play-button"
              >
                🎯 Play Card
              </button>
            )}
            <button
              onClick={handleDiscardSelected}
              className="action-button discard-button"
            >
              🗑 Discard{" "}
              {selectedCards.length > 1
                ? `${selectedCards.length} cards`
                : "card"}
            </button>
          </div>
        )}
      </div>

      <button onClick={onLeaveRoom} className="leave-button">
        🚪 Leave Room
      </button>
    </div>
  );
}
