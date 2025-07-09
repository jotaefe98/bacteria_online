import { useGame } from "../../hooks/game/useGame";

type GameProps = {
  roomId: string;
  isGameStarted: boolean;
  isHost: boolean;
  onLeaveRoom: () => void;
};

export function Game({ roomId, isGameStarted, onLeaveRoom, isHost }: GameProps) {
  const { hand, handleDraw, handleDiscard, currentTurn, canDraw, playerId } =
    useGame({ roomId, isGameStarted, isHost });

  return (
    <div>
      <h2>Partida en curso</h2>
      <p>Tu ID: {playerId}</p>
      <p>
        Turno actual: {currentTurn === playerId ? "¡Tu turno!" : currentTurn}
      </p>
      <button onClick={handleDraw} disabled={!canDraw}>
        Robar carta
      </button>
      <h3>Tu mano:</h3>
      <ul>
        {hand.map((card) => (
          <li
            key={card.id}
            style={{
              cursor: canDraw ? "pointer" : "default",
              display: "inline-block",
              margin: "8px",
              border: "1px solid #ccc",
              padding: "4px",
            }}
            onClick={() => canDraw && handleDiscard(card.id)}
            title={canDraw ? "Haz clic para descartar" : ""}
          >
            {card.type} - {card.color}
          </li>
        ))}
      </ul>
      <button onClick={onLeaveRoom}>Salir de la sala</button>
    </div>
  );
}
