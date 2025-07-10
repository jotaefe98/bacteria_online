import {
  Card,
  OrganState,
  PlayerBoard,
  PlayCardAction,
} from "../types/interfaces";

// Function to verify if a color is compatible (including rainbow)
export function isColorCompatible(
  cardColor: string,
  targetColor: string
): boolean {
  return (
    cardColor === "rainbow" ||
    targetColor === "rainbow" ||
    cardColor === targetColor
  );
}

// Function to calculate organ status
export function calculateOrganStatus(
  organState: OrganState
): "healthy" | "infected" | "vaccinated" | "immunized" | "destroyed" {
  const virusCount = organState.viruses.length;
  const medicineCount = organState.medicines.length;

  if (virusCount >= 2) {
    return "destroyed";
  }

  if (medicineCount >= 2) {
    return "immunized";
  }

  if (medicineCount === 1) {
    if (virusCount === 1) {
      return "healthy"; // Medicine cures the virus
    }
    return "vaccinated";
  }

  if (virusCount === 1) {
    return "infected";
  }

  return "healthy";
}

// Function to verify if a card can be played
export function canPlayCard(
  card: Card,
  playerBoard: PlayerBoard,
  targetBoard?: PlayerBoard,
  targetOrganColor?: string
): { canPlay: boolean; reason?: string } {
  switch (card.type) {
    case "organ":
      // Cannot have two organs of the same color (except rainbow)
      if (card.color !== "rainbow" && playerBoard.organs[card.color]) {
        return {
          canPlay: false,
          reason: "You already have an organ of this color",
        };
      }
      return { canPlay: true };

    case "virus":
      if (!targetBoard || !targetOrganColor) {
        return {
          canPlay: false,
          reason: "You must select a target organ",
        };
      }

      const targetOrgan = targetBoard.organs[targetOrganColor];
      if (!targetOrgan) {
        return { canPlay: false, reason: "Target organ does not exist" };
      }

      if (!isColorCompatible(card.color, targetOrgan.organ.color)) {
        return {
          canPlay: false,
          reason: "Virus must be the same color as the organ",
        };
      }

      if (targetOrgan.status === "immunized") {
        return {
          canPlay: false,
          reason: "Cannot infect an immunized organ",
        };
      }

      return { canPlay: true };

    case "medicine":
      if (!targetBoard || !targetOrganColor) {
        return {
          canPlay: false,
          reason: "You must select a target organ",
        };
      }

      const medicineTargetOrgan = targetBoard.organs[targetOrganColor];
      if (!medicineTargetOrgan) {
        return { canPlay: false, reason: "Target organ does not exist" };
      }

      if (!isColorCompatible(card.color, medicineTargetOrgan.organ.color)) {
        return {
          canPlay: false,
          reason: "Medicine must be the same color as the organ",
        };
      }

      return { canPlay: true };

    case "treatment":
      // Treatments have specific rules that will be verified in applyCardEffect
      return { canPlay: true };

    default:
      return { canPlay: false, reason: "Unknown card type" };
  }
}

// Function to apply card effect
export function applyCardEffect(
  card: Card,
  playerBoard: PlayerBoard,
  targetBoard: PlayerBoard | undefined,
  targetOrganColor: string | undefined,
  allBoards: { [playerId: string]: PlayerBoard }
): { success: boolean; changes?: any; reason?: string } {
  switch (card.type) {
    case "organ":
      const organColor = card.color === "rainbow" ? "rainbow" : card.color;
      playerBoard.organs[organColor] = {
        organ: card,
        viruses: [],
        medicines: [],
        status: "healthy",
      };
      return { success: true, changes: { type: "organ_played", organ: card } };

    case "virus":
      if (!targetBoard || !targetOrganColor) {
        return { success: false, reason: "Invalid target" };
      }

      const targetOrgan = targetBoard.organs[targetOrganColor];
      if (targetOrgan.status === "vaccinated") {
        // Virus destroys the vaccine
        targetOrgan.medicines = [];
        targetOrgan.status = calculateOrganStatus(targetOrgan);
        return {
          success: true,
          changes: {
            type: "virus_played",
            target: targetOrganColor,
            vaccineDestroyed: true,
          },
        };
      } else {
        targetOrgan.viruses.push(card);
        targetOrgan.status = calculateOrganStatus(targetOrgan);

        // If organ is destroyed, remove it from board
        if (targetOrgan.status === "destroyed") {
          delete targetBoard.organs[targetOrganColor];
          return {
            success: true,
            changes: {
              type: "virus_played",
              target: targetOrganColor,
              organDestroyed: true,
            },
          };
        }
      }

      return {
        success: true,
        changes: { type: "virus_played", target: targetOrganColor },
      };

    case "medicine":
      if (!targetBoard || !targetOrganColor) {
        return { success: false, reason: "Invalid target" };
      }

      const medicineTarget = targetBoard.organs[targetOrganColor];

      // If there are viruses, medicine cures one
      if (medicineTarget.viruses.length > 0) {
        medicineTarget.viruses.pop(); // Remove one virus
      } else {
        // If no viruses, medicine is applied as vaccine/immunization
        medicineTarget.medicines.push(card);
      }

      medicineTarget.status = calculateOrganStatus(medicineTarget);
      return {
        success: true,
        changes: { type: "medicine_played", target: targetOrganColor },
      };

    case "treatment":
      // Treatment effects need additional parameters
      return {
        success: false,
        reason: "Treatment effects need to be called with proper parameters",
      };

    default:
      return { success: false, reason: "Unknown card type" };
  }
}

// Function to apply treatment effects with full context
export function applyTreatmentEffect(
  card: Card,
  allBoards: { [playerId: string]: PlayerBoard },
  currentPlayerId: string,
  action: PlayCardAction
): { success: boolean; changes?: any; reason?: string } {
  switch (card.color) {
    case "transplant":
      return applyTransplant(allBoards, currentPlayerId, action);

    case "organ_thief":
      return applyOrganThief(allBoards, currentPlayerId, action);

    case "contagion":
      return applyContagion(allBoards, currentPlayerId);

    case "latex_glove":
      return applyLatexGlove();

    case "medical_error":
      return applyMedicalError(allBoards, currentPlayerId, action);

    default:
      return { success: false, reason: "Unknown treatment" };
  }
}

// TRANSPLANT: Exchange organs between two players
function applyTransplant(
  allBoards: { [playerId: string]: PlayerBoard },
  currentPlayerId: string,
  action: PlayCardAction
): { success: boolean; changes?: any; reason?: string } {
  if (
    !action.targetPlayerId ||
    !action.targetOrganColor ||
    !action.secondTargetPlayerId ||
    !action.secondTargetOrganColor
  ) {
    return {
      success: false,
      reason: "Must select two organs from different players",
    };
  }

  const firstBoard = allBoards[action.targetPlayerId];
  const secondBoard = allBoards[action.secondTargetPlayerId];

  if (!firstBoard || !secondBoard) {
    return { success: false, reason: "Invalid target players" };
  }

  const firstOrgan = firstBoard.organs[action.targetOrganColor];
  const secondOrgan = secondBoard.organs[action.secondTargetOrganColor];

  if (!firstOrgan || !secondOrgan) {
    return { success: false, reason: "Selected organs do not exist" };
  }

  // Cannot exchange immunized organs
  if (firstOrgan.status === "immunized" || secondOrgan.status === "immunized") {
    return { success: false, reason: "Cannot exchange immunized organs" };
  }

  // Check if exchange would create duplicate colors
  const firstPlayerColors = Object.keys(firstBoard.organs).filter(
    (c) => c !== action.targetOrganColor
  );
  const secondPlayerColors = Object.keys(secondBoard.organs).filter(
    (c) => c !== action.secondTargetOrganColor
  );

  if (
    secondOrgan.organ.color !== "rainbow" &&
    firstPlayerColors.includes(secondOrgan.organ.color)
  ) {
    return {
      success: false,
      reason: "First player would have duplicate organ colors",
    };
  }

  if (
    firstOrgan.organ.color !== "rainbow" &&
    secondPlayerColors.includes(firstOrgan.organ.color)
  ) {
    return {
      success: false,
      reason: "Second player would have duplicate organ colors",
    };
  }

  // Perform the exchange
  const temp = firstBoard.organs[action.targetOrganColor];
  firstBoard.organs[action.targetOrganColor] =
    secondBoard.organs[action.secondTargetOrganColor];
  secondBoard.organs[action.secondTargetOrganColor] = temp;

  return {
    success: true,
    changes: {
      type: "treatment_played",
      treatment: "transplant",
      firstPlayer: action.targetPlayerId,
      secondPlayer: action.secondTargetPlayerId,
      firstOrgan: action.targetOrganColor,
      secondOrgan: action.secondTargetOrganColor,
    },
  };
}

// ORGAN THIEF: Steal an organ from another player
function applyOrganThief(
  allBoards: { [playerId: string]: PlayerBoard },
  currentPlayerId: string,
  action: PlayCardAction
): { success: boolean; changes?: any; reason?: string } {
  if (!action.targetPlayerId || !action.targetOrganColor) {
    return { success: false, reason: "Must select an organ to steal" };
  }

  if (action.targetPlayerId === currentPlayerId) {
    return { success: false, reason: "Cannot steal from yourself" };
  }

  const targetBoard = allBoards[action.targetPlayerId];
  const thiefBoard = allBoards[currentPlayerId];

  if (!targetBoard || !thiefBoard) {
    return { success: false, reason: "Invalid players" };
  }

  const organToSteal = targetBoard.organs[action.targetOrganColor];

  if (!organToSteal) {
    return { success: false, reason: "Target organ does not exist" };
  }

  // Cannot steal immunized organs
  if (organToSteal.status === "immunized") {
    return { success: false, reason: "Cannot steal immunized organs" };
  }

  // Check if thief would have duplicate colors
  const thiefColors = Object.keys(thiefBoard.organs);
  if (
    organToSteal.organ.color !== "rainbow" &&
    thiefColors.includes(action.targetOrganColor)
  ) {
    return { success: false, reason: "You would have duplicate organ colors" };
  }

  // Steal the organ
  thiefBoard.organs[action.targetOrganColor] = organToSteal;
  delete targetBoard.organs[action.targetOrganColor];

  return {
    success: true,
    changes: {
      type: "treatment_played",
      treatment: "organ_thief",
      targetPlayer: action.targetPlayerId,
      stolenOrgan: action.targetOrganColor,
    },
  };
}

// CONTAGION: Transfer viruses from current player to others randomly
function applyContagion(
  allBoards: { [playerId: string]: PlayerBoard },
  currentPlayerId: string
): { success: boolean; changes?: any; reason?: string } {
  const currentBoard = allBoards[currentPlayerId];
  const infectedOrgans = Object.entries(currentBoard.organs).filter(
    ([_, organ]) => organ.viruses.length > 0
  );

  if (infectedOrgans.length === 0) {
    return { success: false, reason: "You have no infected organs to spread" };
  }

  const contagionResults: any[] = [];
  const otherPlayerIds = Object.keys(allBoards).filter(
    (id) => id !== currentPlayerId
  );

  // For each infected organ, try to spread to other players
  infectedOrgans.forEach(([organColor, organState]) => {
    if (organState.viruses.length > 0) {
      const virus = organState.viruses[0]; // Take one virus

      // Find all players with healthy (free) organs of compatible color
      const validTargets = otherPlayerIds.filter((playerId) => {
        const targetBoard = allBoards[playerId];
        // Look for organs of the same color or rainbow organs
        const compatibleOrgans = Object.entries(targetBoard.organs).filter(
          ([targetColor, targetOrgan]) => {
            const isColorCompatible =
              targetColor === organColor ||
              targetColor === "rainbow" ||
              organColor === "rainbow";
            const isFree =
              targetOrgan.status === "healthy" &&
              targetOrgan.viruses.length === 0 &&
              targetOrgan.medicines.length === 0;
            return isColorCompatible && isFree;
          }
        );
        return compatibleOrgans.length > 0;
      });

      if (validTargets.length > 0) {
        const randomTargetPlayerId =
          validTargets[Math.floor(Math.random() * validTargets.length)];
        const targetBoard = allBoards[randomTargetPlayerId];

        // Find a random compatible organ in the target player's board
        const compatibleOrgans = Object.entries(targetBoard.organs).filter(
          ([targetColor, targetOrgan]) => {
            const isColorCompatible =
              targetColor === organColor ||
              targetColor === "rainbow" ||
              organColor === "rainbow";
            const isFree =
              targetOrgan.status === "healthy" &&
              targetOrgan.viruses.length === 0 &&
              targetOrgan.medicines.length === 0;
            return isColorCompatible && isFree;
          }
        );

        if (compatibleOrgans.length > 0) {
          const [targetOrganColor, targetOrgan] =
            compatibleOrgans[
              Math.floor(Math.random() * compatibleOrgans.length)
            ];

          // Transfer virus
          organState.viruses.splice(0, 1); // Remove virus from source
          targetOrgan.viruses.push(virus); // Add to target

          // Update statuses
          organState.status = calculateOrganStatus(organState);
          targetOrgan.status = calculateOrganStatus(targetOrgan);

          contagionResults.push({
            targetPlayer: randomTargetPlayerId,
            organColor: targetOrganColor,
            virusType: virus.color,
          });
        }
      }
    }
  });

  return {
    success: true,
    changes: {
      type: "treatment_played",
      treatment: "contagion",
      contagionResults,
    },
  };
}

// LATEX GLOVE: All other players discard their hands
function applyLatexGlove(): {
  success: boolean;
  changes?: any;
  reason?: string;
} {
  return {
    success: true,
    changes: {
      type: "treatment_played",
      treatment: "latex_glove",
    },
  };
}

// MEDICAL ERROR: Exchange entire body with another player
function applyMedicalError(
  allBoards: { [playerId: string]: PlayerBoard },
  currentPlayerId: string,
  action: PlayCardAction
): { success: boolean; changes?: any; reason?: string } {
  if (!action.targetPlayerId && !action.targetOrganColor) {
    return {
      success: false,
      reason: "Must select an organ from target player to exchange bodies",
    };
  }

  let targetPlayerId = action.targetPlayerId;

  // If no target player specified but organ is selected, derive player from organ selection
  if (!targetPlayerId && action.targetOrganColor) {
    // Find which player has the selected organ color
    for (const [playerId, board] of Object.entries(allBoards)) {
      if (
        playerId !== currentPlayerId &&
        board.organs[action.targetOrganColor]
      ) {
        targetPlayerId = playerId;
        break;
      }
    }
  }

  if (!targetPlayerId) {
    return {
      success: false,
      reason: "Must select a target player to exchange bodies with",
    };
  }

  if (targetPlayerId === currentPlayerId) {
    return { success: false, reason: "Cannot exchange body with yourself" };
  }

  const currentBoard = allBoards[currentPlayerId];
  const targetBoard = allBoards[targetPlayerId];

  if (!currentBoard || !targetBoard) {
    return { success: false, reason: "Invalid players" };
  }

  // Exchange entire organ collections
  const temp = currentBoard.organs;
  currentBoard.organs = targetBoard.organs;
  targetBoard.organs = temp;

  return {
    success: true,
    changes: {
      type: "treatment_played",
      treatment: "medical_error",
      targetPlayer: targetPlayerId,
    },
  };
}

// Function to check win condition
export function checkWinCondition(playerBoard: PlayerBoard): boolean {
  const healthyOrgans = Object.values(playerBoard.organs).filter(
    (organ) =>
      organ.status === "healthy" ||
      organ.status === "vaccinated" ||
      organ.status === "immunized"
  );

  // Needs 4 organs of different colors
  const colors = new Set();
  for (const organ of healthyOrgans) {
    if (organ.organ.color === "rainbow") {
      // Rainbow counts as any missing color
      const missingColors = ["red", "green", "blue", "yellow"].filter(
        (color) => !colors.has(color)
      );
      if (missingColors.length > 0) {
        colors.add(missingColors[0]);
      }
    } else {
      colors.add(organ.organ.color);
    }
  }

  return colors.size >= 4;
}

// Function to get playable cards
export function getPlayableCards(
  hand: Card[],
  playerBoard: PlayerBoard,
  allBoards: { [playerId: string]: PlayerBoard }
): Card[] {
  return hand.filter((card) => {
    if (card.type === "organ") {
      return canPlayCard(card, playerBoard).canPlay;
    }

    if (card.type === "virus" || card.type === "medicine") {
      // Check if there's at least one valid target
      for (const [playerId, board] of Object.entries(allBoards)) {
        for (const organColor of Object.keys(board.organs)) {
          if (canPlayCard(card, playerBoard, board, organColor).canPlay) {
            return true;
          }
        }
      }
      return false;
    }

    if (card.type === "treatment") {
      return true; // Treatments can generally be played
    }

    return false;
  });
}

// Function to rebuild deck when it's empty, excluding cards in play
export function rebuildDeck(
  baseDeck: Card[],
  hands: { [playerId: string]: Card[] },
  boards: { [playerId: string]: PlayerBoard },
  discardPile: Card[]
): Card[] {
  // Get all cards currently in use (hands + boards only)
  const cardsInUse = new Set<string>();

  // Add cards from all hands
  Object.values(hands).forEach((hand) => {
    hand.forEach((card) => cardsInUse.add(card.id));
  });

  // Add cards from all boards (organs, viruses, medicines)
  Object.values(boards).forEach((board) => {
    Object.values(board.organs).forEach((organState) => {
      // Add the organ itself
      cardsInUse.add(organState.organ.id);
      // Add viruses on this organ
      organState.viruses.forEach((virus) => cardsInUse.add(virus.id));
      // Add medicines on this organ
      organState.medicines.forEach((medicine) => cardsInUse.add(medicine.id));
    });
  });

  // Filter base deck to exclude cards in use (discard pile cards are available)
  const availableCards = baseDeck.filter((card) => !cardsInUse.has(card.id));

  return availableCards;
}
