import "./PlayerList.css";

export default function PlayerList({ players }: { players: string[] }) {
  return (
    <div className="player-list">
      {players.map((player, idx) => (
        <div key={idx} className="player-item">
          <div className="player-avatar">{player === "" ? "⏳" : "👤"}</div>
          <div className="player-info">
            <span className="player-name">
              {player === "" ? "Joining player..." : player}
            </span>
            {idx === 0 && player !== "" && (
              <span className="host-indicator">👑 Host</span>
            )}
          </div>
          <div className="player-status">
            {player === "" ? (
              <span className="status-joining">Joining</span>
            ) : (
              <span className="status-ready">Ready</span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
