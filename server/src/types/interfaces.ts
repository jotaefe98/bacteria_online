export interface Player {
  playerId: string;
  nickname: string;
  socketId: string;
}

export interface DataJoinRoom {
  roomId: string;
  playerId: string;
  nickname: string;
  socketId: string;
}
