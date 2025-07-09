import { useState } from "react";
import { useGame } from "../../hooks/game/useGame";
import { Board } from "../Board/Board";
import type {
  Card,
  PlayCardAction,
} from "../../interfaces/game/gameInterfaces";
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

  const getCardTypeIcon = (type: Card["type"]) => {
    switch (type) {
      case "organ":
        return "🫀";
      case "virus":
        return "🦠";
      case "medicine":
        return "💉";
      case "treatment":
        return "🧪";
      default:
        return "❓";
    }
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
        <h2>🎉 Game Over! 🎉</h2>
        <p>{winner === playerId ? "You won!" : `Winner: ${winner}`}</p>
        <button onClick={onLeaveRoom}>Leave Room</button>
      </div>
    );
  }

  return (
    <div className="game-container">
      <div className="game-header">
        <h2>🦠 Virus! - Game in Progress</h2>
        <div className="game-info">
          <p>
            <strong>Your ID:</strong> {playerId}
          </p>
          <p>
            <strong>Turn:</strong>{" "}
            {currentTurn === playerId ? "Your turn!" : currentTurn}
          </p>
          <p>
            <strong>Phase:</strong> {getPhaseText()}
          </p>
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
          🎯 Target: {selectedTarget.organColor} organ from{" "}
          {selectedTarget.playerId}
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
            <div
              key={card.id}
              className={`card ${
                selectedCards.includes(card.id) ? "selected" : ""
              }`}
              onClick={() => canPlay && toggleCardSelection(card.id)}
            >
              <div className="card-icon">{getCardTypeIcon(card.type)}</div>
              <div className="card-type">{card.type.toUpperCase()}</div>
              <div className="card-color">{card.color.toUpperCase()}</div>
            </div>
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
