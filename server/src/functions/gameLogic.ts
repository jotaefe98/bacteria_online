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

// Function to check if contagion can be played (has valid targets)
export function canPlayContagion(
  currentBoard: PlayerBoard,
  allBoards: { [playerId: string]: PlayerBoard },
  currentPlayerId: string
): { canPlay: boolean; reason?: string } {
  // Check if player has infected organs
  const infectedOrgans = Object.entries(currentBoard.organs).filter(
    ([_, organ]) => organ.bacteria.length > 0
  );

  if (infectedOrgans.length === 0) {
    return { canPlay: false, reason: "You have no infected organs to spread" };
  }

  const otherPlayerIds = Object.keys(allBoards).filter(
    (id) => id !== currentPlayerId
  );

  // Check if any infected organ can spread to any other player
  for (const [organColor, organState] of infectedOrgans) {
    if (organState.bacteria.length > 0) {
      // Find if there are any valid targets for this infected organ
      const hasValidTargets = otherPlayerIds.some((playerId) => {
        const targetBoard = allBoards[playerId];
        // Look for organs of compatible color that are healthy and free
        const compatibleOrgans = Object.entries(targetBoard.organs).filter(
          ([targetColor, targetOrgan]) => {
            const isColorCompatible =
              targetColor === organColor ||
              targetColor === "rainbow" ||
              organColor === "rainbow";
            const isFree =
              targetOrgan.status === "healthy" &&
              targetOrgan.bacteria.length === 0 &&
              targetOrgan.medicines.length === 0;
            return isColorCompatible && isFree;
          }
        );
        return compatibleOrgans.length > 0;
      });

      if (hasValidTargets) {
        return { canPlay: true };
      }
    }
  }

  return {
    canPlay: false,
    reason: "No valid targets available for contagion",
  };
}

// Function to calculate organ status
export function calculateOrganStatus(
  organState: OrganState
): "healthy" | "infected" | "vaccinated" | "immunized" | "destroyed" {
  const bacteriaCount = organState.bacteria.length;
  const medicineCount = organState.medicines.length;

  if (bacteriaCount >= 2) {
    return "destroyed";
  }

  if (medicineCount >= 2) {
    return "immunized";
  }

  if (medicineCount === 1) {
    if (bacteriaCount === 1) {
      return "healthy"; // Medicine cures the bacteria
    }
    return "vaccinated";
  }

  if (bacteriaCount === 1) {
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

      // Check if placing this organ would create too many of the same effective color
      // This is mainly relevant for rainbow organs
      if (card.color === "rainbow") {
        // Rainbow organs can be placed as long as we don't have more than 4 total organs
        const currentOrganCount = Object.keys(playerBoard.organs).length;
        if (currentOrganCount >= 4) {
          return {
            canPlay: false,
            reason: "You cannot have more than 4 organs",
          };
        }
      }

      return { canPlay: true };

    case "bacteria":
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
          reason: "Bacteria must be the same color as the organ",
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

      // Cannot apply medicine to immunized organs (they already have 2 medicines)
      if (medicineTargetOrgan.status === "immunized") {
        return {
          canPlay: false,
          reason: "Cannot apply medicine to an immunized organ",
        };
      }

      return { canPlay: true };

    case "treatment":
      // Treatments have specific rules that will be verified in canPlayTreatment
      return { canPlay: true };

    default:
      return { canPlay: false, reason: "Unknown card type" };
  }
}

// Function to verify if a treatment card can be played (requires all boards context)
export function canPlayTreatment(
  card: Card,
  allBoards: { [playerId: string]: PlayerBoard },
  currentPlayerId: string,
  action?: PlayCardAction
): { canPlay: boolean; reason?: string } {
  if (card.type !== "treatment") {
    return { canPlay: false, reason: "Not a treatment card" };
  }

  const currentBoard = allBoards[currentPlayerId];

  switch (card.color) {
    case "contagion":
      return canPlayContagion(currentBoard, allBoards, currentPlayerId);

    case "transplant":
      // Transplant requires two valid organs from different players
      if (
        !action?.targetPlayerId ||
        !action?.targetOrganColor ||
        !action?.secondTargetPlayerId ||
        !action?.secondTargetOrganColor
      ) {
        return {
          canPlay: false,
          reason: "Transplant requires two target organs",
        };
      }

      const targetBoard = allBoards[action.targetPlayerId];
      const secondTargetBoard = allBoards[action.secondTargetPlayerId];

      if (!targetBoard || !secondTargetBoard) {
        return { canPlay: false, reason: "Invalid target players" };
      }

      if (!targetBoard.organs[action.targetOrganColor]) {
        return { canPlay: false, reason: "First target organ does not exist" };
      }

      if (!secondTargetBoard.organs[action.secondTargetOrganColor]) {
        return { canPlay: false, reason: "Second target organ does not exist" };
      }

      return { canPlay: true };

    case "organ_thief":
      // Organ thief requires a valid target organ
      if (!action?.targetPlayerId || !action?.targetOrganColor) {
        return {
          canPlay: false,
          reason: "Organ thief requires a target organ",
        };
      }

      const theftTargetBoard = allBoards[action.targetPlayerId];
      if (!theftTargetBoard) {
        return { canPlay: false, reason: "Invalid target player" };
      }

      if (!theftTargetBoard.organs[action.targetOrganColor]) {
        return { canPlay: false, reason: "Target organ does not exist" };
      }

      return { canPlay: true };

    case "medical_error":
      // Medical error requires a valid target organ
      if (!action?.targetPlayerId || !action?.targetOrganColor) {
        return {
          canPlay: false,
          reason: "Medical error requires a target organ",
        };
      }

      const errorTargetBoard = allBoards[action.targetPlayerId];
      if (!errorTargetBoard) {
        return { canPlay: false, reason: "Invalid target player" };
      }

      if (!errorTargetBoard.organs[action.targetOrganColor]) {
        return { canPlay: false, reason: "Target organ does not exist" };
      }

      return { canPlay: true };

    case "latex_glove":
      // Latex glove can always be played
      return { canPlay: true };

    default:
      return { canPlay: false, reason: "Unknown treatment" };
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
        bacteria: [],
        medicines: [],
        status: "healthy",
      };
      return { success: true, changes: { type: "organ_played", organ: card } };

    case "bacteria":
      if (!targetBoard || !targetOrganColor) {
        return { success: false, reason: "Invalid target" };
      }

      const targetOrgan = targetBoard.organs[targetOrganColor];
      if (targetOrgan.status === "vaccinated") {
        // Bacteria destroys the vaccine
        targetOrgan.medicines = [];
        targetOrgan.status = calculateOrganStatus(targetOrgan);
        return {
          success: true,
          changes: {
            type: "bacteria_played",
            target: targetOrganColor,
            vaccineDestroyed: true,
          },
        };
      } else {
        targetOrgan.bacteria.push(card);
        targetOrgan.status = calculateOrganStatus(targetOrgan);

        // If organ is destroyed, remove it from board
        if (targetOrgan.status === "destroyed") {
          delete targetBoard.organs[targetOrganColor];
          return {
            success: true,
            changes: {
              type: "bacteria_played",
              target: targetOrganColor,
              organDestroyed: true,
            },
          };
        }
      }

      return {
        success: true,
        changes: { type: "bacteria_played", target: targetOrganColor },
      };

    case "medicine":
      if (!targetBoard || !targetOrganColor) {
        return { success: false, reason: "Invalid target" };
      }

      const medicineTarget = targetBoard.organs[targetOrganColor];

      // If there are bacteria, medicine cures one
      if (medicineTarget.bacteria.length > 0) {
        medicineTarget.bacteria.pop(); // Remove one bacteria
      } else {
        // If no bacteria, medicine is applied as vaccine/immunization
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

// CONTAGION: Transfer bacteria from current player to others randomly
function applyContagion(
  allBoards: { [playerId: string]: PlayerBoard },
  currentPlayerId: string
): { success: boolean; changes?: any; reason?: string } {
  const currentBoard = allBoards[currentPlayerId];
  const infectedOrgans = Object.entries(currentBoard.organs).filter(
    ([_, organ]) => organ.bacteria.length > 0
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
    if (organState.bacteria.length > 0) {
      const bacteria = organState.bacteria[0]; // Take one bacteria

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
              targetOrgan.bacteria.length === 0 &&
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
              targetOrgan.bacteria.length === 0 &&
              targetOrgan.medicines.length === 0;
            return isColorCompatible && isFree;
          }
        );

        if (compatibleOrgans.length > 0) {
          const [targetOrganColor, targetOrgan] =
            compatibleOrgans[
              Math.floor(Math.random() * compatibleOrgans.length)
            ];

          // Transfer bacteria
          organState.bacteria.splice(0, 1); // Remove bacteria from source
          targetOrgan.bacteria.push(bacteria); // Add to target

          // Update statuses
          organState.status = calculateOrganStatus(organState);
          targetOrgan.status = calculateOrganStatus(targetOrgan);

          contagionResults.push({
            targetPlayer: randomTargetPlayerId,
            organColor: targetOrganColor,
            bacteriaType: bacteria.color,
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
  console.log(
    "Checking win condition for player board:",
    JSON.stringify(playerBoard, null, 2)
  );

  const healthyOrgans = Object.values(playerBoard.organs).filter((organ) => {
    const isHealthy =
      organ.status === "healthy" ||
      organ.status === "vaccinated" ||
      organ.status === "immunized";
    console.log(
      `Organ ${organ.organ.color} status: ${organ.status}, is healthy: ${isHealthy}`
    );
    return isHealthy;
  });

  console.log(`Found ${healthyOrgans.length} healthy organs`);

  if (healthyOrgans.length < 4) {
    console.log("Not enough healthy organs for victory");
    return false;
  }

  // Check for 4 different colors with improved rainbow logic
  const colors = new Set<string>();
  let rainbowCount = 0;

  // First pass: count regular colors and rainbow organs
  for (const organ of healthyOrgans) {
    if (organ.organ.color === "rainbow") {
      rainbowCount++;
    } else {
      colors.add(organ.organ.color);
    }
  }

  console.log(`Regular colors found: ${Array.from(colors)}`);
  console.log(`Rainbow organs found: ${rainbowCount}`);

  // Second pass: assign rainbow organs to fill missing colors
  const allPossibleColors = ["red", "green", "blue", "yellow"];
  const missingColors = allPossibleColors.filter((color) => !colors.has(color));

  console.log(`Missing colors: ${missingColors}`);

  // Use rainbow organs to fill missing colors
  const colorsToFill = Math.min(rainbowCount, missingColors.length);
  const totalUniqueColors = colors.size + colorsToFill;

  console.log(
    `Total unique colors after rainbow assignment: ${totalUniqueColors}`
  );

  const hasWon = totalUniqueColors >= 4;
  console.log(`Win condition met: ${hasWon}`);

  return hasWon;
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

    if (card.type === "bacteria" || card.type === "medicine") {
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

  // Add cards from all boards (organs, bacteria, medicines)
  Object.values(boards).forEach((board) => {
    Object.values(board.organs).forEach((organState) => {
      // Add the organ itself
      cardsInUse.add(organState.organ.id);
      // Add bacteria on this organ
      organState.bacteria.forEach((bacteria) => cardsInUse.add(bacteria.id));
      // Add medicines on this organ
      organState.medicines.forEach((medicine) => cardsInUse.add(medicine.id));
    });
  });

  // Filter base deck to exclude cards in use (discard pile cards are available)
  const availableCards = baseDeck.filter((card) => !cardsInUse.has(card.id));

  return availableCards;
}
