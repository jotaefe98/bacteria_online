type gameProps = {
  onLeaveRoom: () => void;
};

export function Game({ onLeaveRoom }: gameProps) {
  return (
    <div className="room">
      <h1>Game Started</h1>
      <p>The game has already started. Please wait for it to finish.</p>
      <button onClick={onLeaveRoom}>Salir de la sala</button>
    </div>
  );
}
