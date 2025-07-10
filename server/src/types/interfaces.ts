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
  players: Player[];
  has_started: boolean;
  // Indicates if the room is new (just created), for no deleting it
  // when the first player leaves
  new_room: boolean;
}

export interface DataUpdateNickname {
  roomId: string;
  nickname: string;
}

type TypeCard = "bacteria" | "organ" | "medicine" | "treatment";
type ColorCard =
  | "red"
  | "green"
  | "blue"
  | "yellow"
  | "rainbow"
  | "transplant"
  | "organ_thief"
  | "contagion"
  | "latex_glove"
  | "medical_error";

export interface Card {
  id: string;
  type: TypeCard;
  color: ColorCard;
}

// Estado de un órgano en la mesa
export interface OrganState {
  organ: Card;
  bacteria: Card[];
  medicines: Card[];
  status: "healthy" | "infected" | "vaccinated" | "immunized" | "destroyed";
}

// Mesa de un jugador
export interface PlayerBoard {
  organs: { [color: string]: OrganState };
}

// Fases del turno
export type GamePhase = "play_or_discard" | "draw" | "end_turn";

// Para acciones de juego
export interface PlayCardAction {
  cardId: string;
  targetPlayerId?: string;
  targetOrganColor?: string;
  secondTargetPlayerId?: string;
  secondTargetOrganColor?: string;
  additionalData?: any;
}
