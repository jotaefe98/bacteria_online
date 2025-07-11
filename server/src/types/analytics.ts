export interface GameAnalytics {
  gameId: string;
  roomId: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  playerCount: number;
  players: PlayerAnalytics[];
  winner?: string;
  winnerName?: string;
  totalTurns: number;
  deckRebuilds: number;
  gameEvents: GameEvent[];
}

export interface PlayerAnalytics {
  playerId: string;
  playerName: string;
  joinTime: number;
  leaveTime?: number;
  turnsPlayed: number;
  cardsPlayed: number;
  cardsDiscarded: number;
  treatmentsUsed: number;
  timeouts: number;
  totalTurnTime: number; // in milliseconds
  averageTurnTime: number;
  reconnections: number;
  invalidMoves: number;
  organStats: {
    organsDestroyed: number;
    organsHealed: number;
    organsInfected: number;
    organsStolen: number;
  };
}

export interface GameEvent {
  timestamp: number;
  type:
    | "game_start"
    | "game_end"
    | "turn_start"
    | "turn_end"
    | "card_played"
    | "card_discarded"
    | "treatment_used"
    | "timeout"
    | "reconnection"
    | "invalid_move"
    | "deck_rebuilt"
    | "organ_action";
  playerId: string;
  playerName: string;
  data?: any;
  turnNumber?: number;
}

export interface CardPlayedEvent {
  cardId: string;
  cardType: string;
  cardColor: string;
  targetPlayerId?: string;
  targetOrganColor?: string;
  successful: boolean;
  turnTime: number; // time taken to play this card
}

export interface OrganActionEvent {
  action: "infected" | "healed" | "destroyed" | "stolen" | "transplanted";
  organColor: string;
  targetPlayerId?: string;
  byPlayerId: string;
  cardType?: string;
}
