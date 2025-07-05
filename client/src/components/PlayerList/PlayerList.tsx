import './PlayerList.css'

export default function PlayerList({players}: {players: string[]}) {
    return (
        <ul>
            {players.map((player, idx) => (
                <li key={idx}>{player}</li>
            ))}
        </ul>
    );
}