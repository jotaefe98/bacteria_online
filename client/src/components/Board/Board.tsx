import type {
  PlayerBoard,
  OrganState,
} from "../../interfaces/game/gameInterfaces";
import "./Board.css";

interface BoardProps {
  board: PlayerBoard;
  playerId: string;
  isCurrentPlayer: boolean;
  onOrganClick?: (organColor: string) => void;
}

export function Board({
  board,
  playerId,
  isCurrentPlayer,
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
        return "Healthy";
      case "infected":
        return "Infected";
      case "vaccinated":
        return "Vaccinated";
      case "immunized":
        return "Immunized";
      case "destroyed":
        return "Destroyed";
      default:
        return "Healthy";
    }
  };

  return (
    <div className={`board ${isCurrentPlayer ? "my-board" : "other-board"}`}>
      <h4>{isCurrentPlayer ? "Your Table" : `${playerId}'s Table`}</h4>
      <div className="organs-container">
        {Object.entries(board.organs).length === 0 ? (
          <p className="no-organs">No organs on the table</p>
        ) : (
          Object.entries(board.organs).map(([color, organState]) => (
            <div
              key={color}
              className={`organ-card ${organState.status}`}
              style={{ borderColor: getOrganStatusColor(organState.status) }}
              onClick={() => onOrganClick && onOrganClick(color)}
            >
              <div className="organ-header">
                <span className="organ-color">
                  {organState.organ.color.toUpperCase()}
                </span>
                <span className="organ-status">
                  {getStatusText(organState.status)}
                </span>
              </div>

              <div className="organ-details">
                {organState.viruses.length > 0 && (
                  <div className="viruses">
                    <span>🦠 Viruses: {organState.viruses.length}</span>
                  </div>
                )}

                {organState.medicines.length > 0 && (
                  <div className="medicines">
                    <span>💉 Medicines: {organState.medicines.length}</span>
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
