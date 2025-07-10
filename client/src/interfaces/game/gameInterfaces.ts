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

export interface GameState {
  hands: { [playerId: string]: Card[] };
  boards: { [playerId: string]: PlayerBoard };
  currentTurn: string;
  currentPhase: GamePhase;
  playerIdList: string[];
  winner?: string;
  discardPile: Card[];
}

// Para acciones de juego
export interface PlayCardAction {
  cardId: string;
  targetPlayerId?: string;
  targetOrganColor?: string;
  secondTargetPlayerId?: string;
  secondTargetOrganColor?: string;
  additionalData?: any;
}
