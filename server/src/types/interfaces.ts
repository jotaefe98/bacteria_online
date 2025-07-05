export interface Player {
  playerId: string;
  nickname?: string;
  socketId: string;
  isHost?: boolean;
}

export interface DataJoinRoom {
  roomId: string;
  playerId: string;
  nickname: string;
  socketId: string;
}

export interface Room {
  players: Player[],
  has_started: boolean,
  // Indicates if the room is new (just created), for no deleting it
  // when the first player leaves
  new_room: boolean;
}

export interface DataUpdateNickname {
  roomId: string;
  nickname: string;
}
