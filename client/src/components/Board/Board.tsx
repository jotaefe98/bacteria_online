import type {
  PlayerBoard,
  OrganState,
} from "../../interfaces/game/gameInterfaces";
import "./Board.css";

interface BoardProps {
  board: PlayerBoard;
  playerId: string;
  playerName?: string;
  isCurrentPlayer: boolean;
  currentTurn: string;
  onOrganClick?: (organColor: string) => void;
}

export function Board({
  board,
  playerId,
  playerName,
  isCurrentPlayer,
  currentTurn,
  onOrganClick,
}: BoardProps) {
  const getOrganStatusColor = (status: OrganState["status"]) => {
    switch (status) {
      case "healthy":
        return "#28a745";
      case "infected":
        return "#dc3545";
      case "vaccinated":
        return "#007bff";
      case "immunized":
        return "#6f42c1";
      case "destroyed":
        return "#6c757d";
      default:
        return "#28a745";
    }
  };

  const getStatusText = (status: OrganState["status"]) => {
    switch (status) {
      case "healthy":
        return "🌿 Healthy";
      case "infected":
        return "🦠 Infected";
      case "vaccinated":
        return "💉 Vaccinated";
      case "immunized":
        return "🛡️ Immunized";
      case "destroyed":
        return "💀 Destroyed";
      default:
        return "🌿 Healthy";
    }
  };

  const getOrganTypeIcon = (color: string) => {
    switch (color.toLowerCase()) {
      case "red":
        return "❤️"; // Heart
      case "green":
        return "🫁"; // Lungs
      case "blue":
        return "🧠"; // Brain
      case "yellow":
        return "🦴"; // Bone
      case "rainbow":
        return "🌈"; // Rainbow organ
      default:
        return "🫀"; // Generic organ
    }
  };
  return (
    <div className={`board ${isCurrentPlayer ? "my-board" : "other-board"}`}>
      <h4>
        <div>
          {isCurrentPlayer ? (
            <>
              <span className="board-icon">👤</span>
              Your Medical Table
            </>
          ) : (
            <>
              <span className="board-icon">🏥</span>
              {`${playerName || playerId}'s Medical Table`}
            </>
          )}
        </div>

        {currentTurn === playerId && (
          <div
            className={`turn-indicator ${
              isCurrentPlayer ? "my-turn" : "other-turn"
            }`}
          >
            {isCurrentPlayer ? "Your Turn" : `${playerName || playerId}'s Turn`}
          </div>
        )}
      </h4>
      <div className="organs-container">
        {Object.entries(board.organs).length === 0 ? (
          <div className="no-organs">
            <div className="no-organs-icon">🫀</div>
            <p>No organs on the table</p>
            <small>
              Play organ cards to start building your medical collection
            </small>
          </div>
        ) : (
          Object.entries(board.organs).map(([color, organState]) => (
            <div
              key={color}
              className={`organ-card ${organState.status}`}
              data-color={organState.organ.color}
              style={{ borderColor: getOrganStatusColor(organState.status) }}
              onClick={() => onOrganClick && onOrganClick(color)}
            >
              <div className="organ-header">
                <div className="organ-info">
                  <span className="organ-icon">
                    {getOrganTypeIcon(organState.organ.color)}
                  </span>
                  <span className="organ-color">
                    {organState.organ.color.toUpperCase()}
                  </span>
                </div>
                <span className="organ-status">
                  {getStatusText(organState.status)}
                </span>
              </div>

              <div className="organ-details">
                {organState.viruses.length > 0 && (
                  <div className="viruses">
                    <span className="detail-icon">🦠</span>
                    <span>Viruses: {organState.viruses.length}</span>
                  </div>
                )}

                {organState.medicines.length > 0 && (
                  <div className="medicines">
                    <span className="detail-icon">💉</span>
                    <span>Medicines: {organState.medicines.length}</span>
                  </div>
                )}

                {organState.status === "immunized" && (
                  <div className="immunized-indicator">
                    <span className="detail-icon">🛡️</span>
                    <span>Protected from all threats!</span>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
