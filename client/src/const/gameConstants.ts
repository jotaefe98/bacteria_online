// Game Constants
export const GAME_CONSTANTS = {
  // Victory conditions
  ORGANS_NEEDED_TO_WIN: 4,
  MAX_VIRUSES_PER_ORGAN: 2,
  MAX_MEDICINES_PER_ORGAN: 2,

  // Hand management
  CARDS_PER_HAND: 3,

  // UI timeouts and delays
  RECONNECTION_TIMEOUT: 3000,
  TOAST_DURATION_SHORT: 2000,
  TOAST_DURATION_LONG: 4000,
  ROOM_CLEANUP_DELAY: 30000,

  // Nickname validation
  NICKNAME_MIN_LENGTH: 2,
  NICKNAME_MAX_LENGTH: 20,

  // Connection settings
  SOCKET_RECONNECTION_ATTEMPTS: 5,
  SOCKET_RECONNECTION_DELAY: 1000,

  // Organ colors
  ORGAN_COLORS: ["red", "green", "blue", "yellow"] as const,
  SPECIAL_COLORS: ["rainbow"] as const,

  // Card types
  CARD_TYPES: ["organ", "virus", "medicine", "treatment"] as const,

  // Treatment types
  TREATMENTS: {
    TRANSPLANT: "transplant",
    ORGAN_THIEF: "organ_thief",
    CONTAGION: "contagion",
    LATEX_GLOVE: "latex_glove",
    MEDICAL_ERROR: "medical_error",
  } as const,

  // Organ status
  ORGAN_STATUS: {
    HEALTHY: "healthy",
    INFECTED: "infected",
    VACCINATED: "vaccinated",
    IMMUNIZED: "immunized",
    DESTROYED: "destroyed",
  } as const,

  // Game phases
  GAME_PHASES: {
    PLAY_OR_DISCARD: "play_or_discard",
    DRAW: "draw",
    END_TURN: "end_turn",
  } as const,
} as const;

// Type helpers
export type OrganColor = (typeof GAME_CONSTANTS.ORGAN_COLORS)[number];
export type SpecialColor = (typeof GAME_CONSTANTS.SPECIAL_COLORS)[number];
export type CardType = (typeof GAME_CONSTANTS.CARD_TYPES)[number];
export type TreatmentType =
  (typeof GAME_CONSTANTS.TREATMENTS)[keyof typeof GAME_CONSTANTS.TREATMENTS];
export type OrganStatus =
  (typeof GAME_CONSTANTS.ORGAN_STATUS)[keyof typeof GAME_CONSTANTS.ORGAN_STATUS];
export type GamePhase =
  (typeof GAME_CONSTANTS.GAME_PHASES)[keyof typeof GAME_CONSTANTS.GAME_PHASES];
