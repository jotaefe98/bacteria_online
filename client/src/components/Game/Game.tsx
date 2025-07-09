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
};

export function Game({ roomId, isGameStarted, isHost }: GameProps) {
  const {
    hand,
    boards,
    currentTurn,
    currentPhase,
    winner,
    canDraw,
    canPlay,
    playerId,
    playerNames,
    handleDraw,
    handleDiscard,
    handleDiscardMultiple,
    handlePlayCard,
  } = useGame({ roomId, isGameStarted, isHost });

  const [selectedCards, setSelectedCards] = useState<string[]>([]);
  const [selectedTarget, setSelectedTarget] = useState<{
    playerId?: string;
    organColor?: string;
  }>({});
  const getPlayerName = (id: string) => {
    return playerNames[id] || id;
  };

  const getWinnerText = () => {
    if (!winner) return "";
    if (winner === playerId) return "You won!";
    return `Winner: ${getPlayerName(winner)}`;
  };

  const getPhaseText = () => {
    const isMyTurn = currentTurn === playerId;
    if (!isMyTurn) return "Wait for your turn";
    
    switch (currentPhase) {
      case "play_or_discard":
        return "Play a card or discard";
      case "draw":
        return "Draw cards";
      case "end_turn":
        return "Ending turn...";
      default:
        return "";
    }
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

      {/* Hand section - Siguiendo estructura exacta del HTML de ejemplo */}
      <div className="hand-section">
        <div className="div2">
          {/* div2-top - Turno y radio buttons */}
          <div className="div2-top">
            <div className="turn-display">
              <span>
                Turn: {currentTurn === playerId ? "You" : getPlayerName(currentTurn)}
              </span>
              <span className="turn-indicator">
                {getPhaseText()}
              </span>
            </div>
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

          {/* div2-bottom - Cartas a la izquierda, botones a la derecha */}
          <div className="div2-bottom">
            <div className="cards-left">
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
            <div className="cards-right">
              <button
                onClick={handlePlaySelectedCard}
                className="action-button-new play-button"
                disabled={
                  !canPlay ||
                  selectedCards.length !== 1 ||
                  playMode !== "single"
                }
              >
                Play
              </button>
              <button
                onClick={handleDiscardSelected}
                className="action-button-new discard-button"
                disabled={!canPlay || selectedCards.length === 0}
              >
                Discard
              </button>
              <button
                onClick={handleDraw}
                className="action-button-new draw-button"
                disabled={!canDraw}
              >
                Draw
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
