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
      } else {
        targetOrgan.viruses.push(card);
        targetOrgan.status = calculateOrganStatus(targetOrgan);

        // If organ is destroyed, remove it from board
        if (targetOrgan.status === "destroyed") {
          delete targetBoard.organs[targetOrganColor];
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
      return applyTreatmentEffect(card, allBoards);

    default:
      return { success: false, reason: "Unknown card type" };
  }
}

// Function to apply treatment effects
function applyTreatmentEffect(
  card: Card,
  allBoards: { [playerId: string]: PlayerBoard }
): { success: boolean; changes?: any; reason?: string } {
  switch (card.color) {
    case "transplant":
      // Transplant is handled in client/server with player selection
      return {
        success: true,
        changes: { type: "treatment_played", treatment: "transplant" },
      };

    case "organ_thief":
      // Organ thief is handled with selection
      return {
        success: true,
        changes: { type: "treatment_played", treatment: "organ_thief" },
      };

    case "contagion":
      // Contagion is handled with selection
      return {
        success: true,
        changes: { type: "treatment_played", treatment: "contagion" },
      };

    case "latex_glove":
      // All other players discard their hand
      return {
        success: true,
        changes: { type: "treatment_played", treatment: "latex_glove" },
      };

    case "medical_error":
      // Body swap is handled with selection
      return {
        success: true,
        changes: { type: "treatment_played", treatment: "medical_error" },
      };

    default:
      return { success: false, reason: "Unknown treatment" };
  }
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
