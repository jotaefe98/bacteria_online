import { useState, useEffect } from "react";
import { useGame } from "../../hooks/game/useGame";
import { Board } from "../Board/Board";
import Card from "../Card/Card";
import type { PlayCardAction } from "../../interfaces/game/gameInterfaces";
import { useNavigate } from "react-router-dom";
import "./Game.css";

type GameProps = {
  roomId: string;
  isGameStarted: boolean;
  isHost: boolean;
};

export function Game({ roomId, isGameStarted, isHost }: GameProps) {
  const navigate = useNavigate();
  const {
    hand,
    boards,
    currentTurn,
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
    // Para tratamientos que requieren 2 órganos
    secondPlayerId?: string;
    secondOrganColor?: string;
  }>({});
  const [showRulesModal, setShowRulesModal] = useState<boolean>(false);

  // Handle help icon click
  useEffect(() => {
    const handleHelpClick = (e: Event) => {
      const mouseEvent = e as MouseEvent;
      const target = mouseEvent.target as HTMLElement;
      const cardsLeft = target.closest(".cards-left");

      if (cardsLeft) {
        const rect = cardsLeft.getBoundingClientRect();
        const x = mouseEvent.clientX - rect.left;
        const y = mouseEvent.clientY - rect.top;

        // Check if click is within help icon area (adjusted for mobile)
        const iconSize = window.innerWidth <= 768 ? 32 : 28;
        const iconOffset = window.innerWidth <= 768 ? 6 : 8;

        if (
          x >= iconOffset &&
          x <= iconOffset + iconSize &&
          y >= iconOffset &&
          y <= iconOffset + iconSize
        ) {
          e.preventDefault();
          e.stopPropagation();
          setShowRulesModal(true);
        }
      }
    };

    const cardsLeftElement = document.querySelector(".cards-left");
    if (cardsLeftElement) {
      cardsLeftElement.addEventListener("click", handleHelpClick);
      return () =>
        cardsLeftElement.removeEventListener("click", handleHelpClick);
    }
  }, []);

  const getPlayerName = (id: string) => {
    return playerNames[id] || id;
  };

  const getWinnerText = () => {
    if (!winner) return "";
    if (winner === playerId) return "You won!";
    return `Winner: ${getPlayerName(winner)}`;
  };

  const handleBackToMenu = () => {
    // Clear game session data
    localStorage.removeItem("currentRoomId");
    localStorage.removeItem("gameStarted");
    console.log("Game session cleared - returning to main menu");

    // Navigate to main menu
    navigate("/");
  };

  const cardSelection = (cardId: string) => {
    setSelectedCards((prev) =>
      prev.includes(cardId)
        ? prev.filter((id) => id !== cardId)
        : [...prev, cardId]
    );
  };

  const handlePlaySelectedCard = () => {
    if (selectedCards.length !== 1) return;

    const cardId = selectedCards[0];
    const card = hand.find((c) => c.id === cardId);
    if (!card) return;

    // Validate selection based on card type
    if (card.type === "virus" || card.type === "medicine") {
      if (!selectedTarget.playerId || !selectedTarget.organColor) {
        // Could add toast notification here for better UX
        return;
      }
    } else if (card.type === "treatment") {
      switch (card.color) {
        case "transplant":
          if (
            !selectedTarget.playerId ||
            !selectedTarget.organColor ||
            !selectedTarget.secondPlayerId ||
            !selectedTarget.secondOrganColor
          ) {
            // Toast: "Transplant requires selecting two organs from different players"
            return;
          }
          break;
        case "organ_thief":
          if (!selectedTarget.playerId || !selectedTarget.organColor) {
            // Toast: "Organ thief requires selecting an organ to steal"
            return;
          }
          break;
        case "medical_error":
          if (!selectedTarget.playerId || !selectedTarget.organColor) {
            // Toast: "Medical error requires selecting an organ from target player"
            return;
          }
          break;
        case "contagion":
        case "latex_glove":
          // These don't need selections - they can be played immediately
          break;
      }
    }

    const action: PlayCardAction = {
      cardId,
      targetPlayerId: selectedTarget.playerId,
      targetOrganColor: selectedTarget.organColor,
      secondTargetPlayerId: selectedTarget.secondPlayerId,
      secondTargetOrganColor: selectedTarget.secondOrganColor,
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
    const selectedCard =
      selectedCards.length > 0
        ? hand.find((c) => c.id === selectedCards[0])
        : null;

    // For virus and medicine, only allow one organ selection
    if (
      selectedCard &&
      (selectedCard.type === "virus" || selectedCard.type === "medicine")
    ) {
      if (
        selectedTarget.playerId === organPlayerId &&
        selectedTarget.organColor === organColor
      ) {
        setSelectedTarget({});
      } else {
        setSelectedTarget({ playerId: organPlayerId, organColor });
      }
      return;
    }

    // For treatments, handle selection based on treatment type
    if (selectedCard && selectedCard.type === "treatment") {
      // Special handling for contagion and latex glove - no selection needed
      if (
        selectedCard.color === "contagion" ||
        selectedCard.color === "latex_glove"
      ) {
        // These treatments don't need organ selection, can be played immediately
        return;
      }

      // Medical error - only needs one organ selection to identify target player
      if (selectedCard.color === "medical_error") {
        if (organPlayerId === playerId) {
          // Show toast: cannot target yourself
          return;
        }
        if (
          selectedTarget.playerId === organPlayerId &&
          selectedTarget.organColor === organColor
        ) {
          setSelectedTarget({});
        } else {
          setSelectedTarget({ playerId: organPlayerId, organColor });
        }
        return;
      }

      // Organ thief - only needs one organ selection
      if (selectedCard.color === "organ_thief") {
        if (organPlayerId === playerId) {
          // Show toast: cannot steal from yourself
          return;
        }
        if (
          selectedTarget.playerId === organPlayerId &&
          selectedTarget.organColor === organColor
        ) {
          setSelectedTarget({});
        } else {
          setSelectedTarget({ playerId: organPlayerId, organColor });
        }
        return;
      }

      // Transplant - needs two organs from different players
      if (selectedCard.color === "transplant") {
        // If clicking on already selected first organ, deselect it
        if (
          selectedTarget.playerId === organPlayerId &&
          selectedTarget.organColor === organColor
        ) {
          setSelectedTarget({
            secondPlayerId: selectedTarget.secondPlayerId,
            secondOrganColor: selectedTarget.secondOrganColor,
          });
          return;
        }

        // If clicking on already selected second organ, deselect it
        if (
          selectedTarget.secondPlayerId === organPlayerId &&
          selectedTarget.secondOrganColor === organColor
        ) {
          setSelectedTarget({
            playerId: selectedTarget.playerId,
            organColor: selectedTarget.organColor,
          });
          return;
        }

        // If no organs selected, select as first
        if (!selectedTarget.playerId) {
          setSelectedTarget({ playerId: organPlayerId, organColor });
          return;
        }

        // If first organ selected and clicking on different player, select as second
        if (
          selectedTarget.playerId !== organPlayerId &&
          !selectedTarget.secondPlayerId
        ) {
          setSelectedTarget({
            ...selectedTarget,
            secondPlayerId: organPlayerId,
            secondOrganColor: organColor,
          });
          return;
        }

        // If both organs selected, replace the one from the same player
        if (selectedTarget.playerId === organPlayerId) {
          setSelectedTarget({
            ...selectedTarget,
            playerId: organPlayerId,
            organColor: organColor,
          });
        } else if (selectedTarget.secondPlayerId === organPlayerId) {
          setSelectedTarget({
            ...selectedTarget,
            secondPlayerId: organPlayerId,
            secondOrganColor: organColor,
          });
        }
        return;
      }
    }

    // Default behavior for other cards or no card selected
    if (
      selectedTarget.playerId === organPlayerId &&
      selectedTarget.organColor === organColor
    ) {
      setSelectedTarget({});
    } else {
      setSelectedTarget({ playerId: organPlayerId, organColor });
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
            <button className="back-to-menu-button" onClick={handleBackToMenu}>
              🏠 Back to Main Menu
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="game-container">
      {/* Boards of all players */}
      <div
        className="boards-container"
        data-player-count={Object.keys(boards).length}
      >
        {Object.entries(boards)
          .sort(([playerBoardId]) => {
            // El jugador actual siempre al final
            return playerBoardId === playerId ? 1 : -1;
          })
          .map(([playerBoardId, board]) => (
            <Board
              key={playerBoardId}
              board={board}
              playerId={playerBoardId}
              playerName={getPlayerName(playerBoardId)}
              isCurrentPlayer={playerBoardId === playerId}
              currentTurn={currentTurn}
              onOrganClick={(organColor) =>
                handleOrganClick(playerBoardId, organColor)
              }
              selectedTarget={selectedTarget}
            />
          ))}
      </div>

      <div className="hand-section">
        {/* div2-bottom - Cards in the left, buttons in the right */}
        <div className="div2-bottom">
          <div className="cards-left">
            {hand.map((card) => (
              <Card
                key={card.id}
                card={card}
                isSelected={selectedCards.includes(card.id)}
                onClick={() => canPlay && cardSelection(card.id)}
                disabled={!canPlay}
              />
            ))}
          </div>
          <div className="cards-right">
            <button
              onClick={handlePlaySelectedCard}
              className="action-button-new play-button"
              disabled={!canPlay || selectedCards.length !== 1}
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

      {/* Modal de reglas del juego */}
      {showRulesModal && (
        <div
          className="game-rules-modal"
          onClick={() => setShowRulesModal(false)}
        >
          <div
            className="game-rules-content"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="game-rules-header">
              <h2 className="game-rules-title">🦠 Virus! - Game Rules</h2>
              <button
                className="close-button"
                onClick={() => setShowRulesModal(false)}
              >
                ×
              </button>
            </div>

            <div className="treatment-section">
              <div className="treatment-title">🎯 Game Objective</div>
              <div className="treatment-description">
                Be the first player to complete a healthy body with 4 organs of
                different colors.
              </div>
            </div>

            <div className="treatment-section">
              <div className="treatment-title">🫀 TRANSPLANT</div>
              <div className="treatment-description">
                🔄 Exchange one organ between two players.
              </div>
              <div className="treatment-rules">
                <ul>
                  <li>
                    Color doesn't matter, nor if they are healthy, infected or
                    vaccinated
                  </li>
                  <li>Cannot exchange immunized organs</li>
                  <li>
                    No player can end up with two organs of the same color
                  </li>
                </ul>
              </div>
            </div>

            <div className="treatment-section">
              <div className="treatment-title">🦹‍♂️ ORGAN THIEF</div>
              <div className="treatment-description">
                🩺 Steal an organ from another player and add it to your body.
              </div>
              <div className="treatment-rules">
                <ul>
                  <li>Can steal: free, vaccinated, or infected organs</li>
                  <li>Cannot steal immunized organs</li>
                  <li>Cannot end up with two organs of the same color</li>
                </ul>
              </div>
            </div>

            <div className="treatment-section">
              <div className="treatment-title">🧫 CONTAGION</div>
              <div className="treatment-description">
                🧟 Transfer viruses from your organs to other players' organs.
              </div>
              <div className="treatment-rules">
                <ul>
                  <li>Can only infect completely free organs</li>
                  <li>Cannot infect already infected or vaccinated organs</li>
                  <li>Transfers one virus per infected organ you have</li>
                  <li>Targets are chosen randomly</li>
                </ul>
              </div>
            </div>

            <div className="treatment-section">
              <div className="treatment-title">🧤 LATEX GLOVE</div>
              <div className="treatment-description">
                🃏 All players except you discard their entire hand.
              </div>
              <div className="treatment-rules">
                <ul>
                  <li>Affected players start their next turn in draw phase</li>
                  <li>They cannot play cards if their hand is empty</li>
                </ul>
              </div>
            </div>

            <div className="treatment-section">
              <div className="treatment-title">🧪 MEDICAL ERROR</div>
              <div className="treatment-description">
                🔁 Exchange your entire body with another player.
              </div>
              <div className="treatment-rules">
                <ul>
                  <li>Includes: organs, viruses, and medicines</li>
                  <li>Immunized organs are also exchanged</li>
                  <li>Number of cards on the table doesn't matter</li>
                </ul>
              </div>
            </div>

            <div className="treatment-section">
              <div className="treatment-title">🎮 How to Play</div>
              <div className="treatment-rules">
                <ul>
                  <li>
                    <strong>Select cards:</strong> Click on cards in your hand
                  </li>
                  <li>
                    <strong>Target organs:</strong> Click on organs on the
                    boards
                  </li>
                  <li>
                    <strong>Virus/Medicine:</strong> Select 1 organ
                  </li>
                  <li>
                    <strong>Transplant:</strong> Select 2 organs from different
                    players
                  </li>
                  <li>
                    <strong>Organ Thief/Medical Error:</strong> Select 1 organ
                    from another player
                  </li>
                  <li>
                    <strong>Contagion/Latex Glove:</strong> No selection needed
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
