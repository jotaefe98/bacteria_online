export interface PlayersUpdate {
    nickname: string,
    isHost: boolean,
    playerId: string,
}

export interface roomSettings {
    min_players: number,
    max_players: number,
}