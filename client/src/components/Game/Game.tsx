import { useState } from "react";
import { useGame } from "../../hooks/game/useGame";
import { Board } from "../Board/Board";
import Card from "../Card/Card";
import type { PlayCardAction } from "../../interfaces/game/gameInterfaces";
import "./Game_new.css";

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
    playerNames,
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
  const getPlayerName = (id: string) => {
    return playerNames[id] || id;
  };

  const getCurrentTurnPlayerName = () => {
    if (currentTurn === playerId) return "Your turn!";
    return getPlayerName(currentTurn);
  };

  const getWinnerText = () => {
    if (!winner) return "";
    if (winner === playerId) return "You won!";
    return `Winner: ${getPlayerName(winner)}`;
  };

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
                  <p className="loser-text">{getWinnerText()}</p>
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
      {/* Tableros de todos los jugadores */}
      <div
        className="boards-container"
        data-player-count={Object.keys(boards).length}
      >
        {Object.entries(boards).map(([playerBoardId, board]) => (
          <Board
            key={playerBoardId}
            board={board}
            playerId={playerBoardId}
            playerName={getPlayerName(playerBoardId)}
            isCurrentPlayer={playerBoardId === playerId}
            onOrganClick={(organColor) =>
              handleOrganClick(playerBoardId, organColor)
            }
          />
        ))}
      </div>

      {/* Game controls */}

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
                  : getPlayerName(selectedTarget.playerId)}
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
        {/* Game notifications just above hand */}
        {gameError && <div className="error-message">❌ {gameError}</div>}

        <div className="hand-header">
          <div className="hand-title-section">
            <h3>🃏 Your Hand ({hand.length} cards)</h3>
            <div className="game-status-compact">
              <div
                className={`turn-status ${
                  currentTurn === playerId ? "your-turn" : "other-turn"
                }`}
              >
                <strong>Turn:</strong>
                <span>
                  {currentTurn === playerId ? (
                    <>🎯 Your turn!</>
                  ) : (
                    <>⏳ {getPlayerName(currentTurn)}</>
                  )}
                </span>
              </div>
              <div className="phase-status">
                <strong>Phase:</strong>
                <span>
                  {currentPhase === "play_or_discard"
                    ? "🎯"
                    : currentPhase === "draw"
                    ? "🃏"
                    : "⏭"}{" "}
                  {getPhaseText()}
                </span>
              </div>
            </div>
          </div>

          <div className="hand-controls">
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

            <button onClick={onLeaveRoom} className="leave-button-compact">
              🚪 Leave
            </button>
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

        {((canPlay && selectedCards.length > 0) || canDraw || canEndTurn) && (
          <div className="hand-actions">
            {canDraw && (
              <button
                onClick={handleDraw}
                className="action-button draw-button"
              >
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

            {canPlay && selectedCards.length > 0 && (
              <>
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
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
