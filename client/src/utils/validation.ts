import { GAME_CONSTANTS } from "../const/gameConstants";

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Validates a nickname according to game rules
 */
export function validateNickname(nickname: string): ValidationResult {
  const trimmed = nickname.trim();

  if (trimmed.length < GAME_CONSTANTS.NICKNAME_MIN_LENGTH) {
    return {
      isValid: false,
      error: `Nickname must be at least ${GAME_CONSTANTS.NICKNAME_MIN_LENGTH} characters long`,
    };
  }

  if (trimmed.length > GAME_CONSTANTS.NICKNAME_MAX_LENGTH) {
    return {
      isValid: false,
      error: `Nickname must not exceed ${GAME_CONSTANTS.NICKNAME_MAX_LENGTH} characters`,
    };
  }

  // Check for invalid characters (allow letters, numbers, spaces, and common symbols)
  const validPattern = /^[a-zA-Z0-9\s._-]+$/;
  if (!validPattern.test(trimmed)) {
    return {
      isValid: false,
      error:
        "Nickname contains invalid characters. Only letters, numbers, spaces, dots, underscores, and hyphens are allowed.",
    };
  }

  // Check for profanity or inappropriate content (basic check)
  const forbiddenWords = ["admin", "bot", "system", "null", "undefined"];
  const lowerNickname = trimmed.toLowerCase();

  for (const word of forbiddenWords) {
    if (lowerNickname.includes(word)) {
      return {
        isValid: false,
        error: "Nickname contains forbidden words",
      };
    }
  }

  return { isValid: true };
}

/**
 * Validates a room ID format
 */
export function validateRoomId(roomId: string): ValidationResult {
  if (!roomId || roomId.trim().length === 0) {
    return {
      isValid: false,
      error: "Room ID cannot be empty",
    };
  }

  // Room IDs should be alphanumeric and of specific length
  const trimmed = roomId.trim();
  if (trimmed.length !== 6) {
    return {
      isValid: false,
      error: "Room ID must be exactly 6 characters long",
    };
  }

  if (!/^[A-Z0-9]+$/.test(trimmed)) {
    return {
      isValid: false,
      error: "Room ID must contain only uppercase letters and numbers",
    };
  }

  return { isValid: true };
}
