import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { SOCKET_SERVER_URL } from "../../const/const";

type Card = {
  id: string;
  type: string;
  color: string;
};

type GameProps = {
  onLeaveRoom: () => void;
};

export function Game({ onLeaveRoom }: GameProps) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [hand, setHand] = useState<Card[]>([]);
  const [currentTurn, setCurrentTurn] = useState<string>("");
  const [playerId, setPlayerId] = useState<string>("");

  const [canDraw, setCanDraw] = useState(false);

  const roomId = window.location.pathname.split("/").pop() || "";

  // 1. Carga playerId antes de conectar socket
  useEffect(() => {
    const id = localStorage.getItem("playerId") || "";
    setPlayerId(id);
  }, []);

  // 2. Solo conecta socket y escucha eventos si hay playerId
  useEffect(() => {
    if (!playerId) return;
    console
    const s = io(SOCKET_SERVER_URL);
    setSocket(s);

    s.on("game-started", (_ok, data) => {
      setHand(data.hands[playerId] || []);
      setCurrentTurn(data.currentTurn);
    });

    s.on("update-game", (data) => {
      setHand(data.hands[playerId] || []);
      setCurrentTurn(data.currentTurn);
    });

    return () => {
      s.disconnect();
    };
  }, [playerId]);

  useEffect(() => {
    setCanDraw(currentTurn === playerId);
  }, [currentTurn, playerId]);

  const handleDraw = () => {
    if (socket && canDraw) {
      socket.emit("draw-card", roomId, playerId);
    }
  };

  const handleDiscard = (cardId: string) => {
    if (socket && canDraw) {
      socket.emit("discard-card", roomId, playerId, cardId);
    }
  };

  return (
    <div>
      <h2>Partida en curso</h2>
      <p>Tu ID: {playerId}</p>
      <p>Turno actual: {currentTurn === playerId ? "¡Tu turno!" : currentTurn}</p>
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