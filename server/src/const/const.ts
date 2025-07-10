import { Card } from "../types/interfaces";

export const MIN_NUM_PLAYERS = 2;
export const MAX_NUM_PLAYERS = 4;

// En el mazo hay 68 cartas divididas así:

export const BASE_DECK: Card[] = [
  // Organs (5 for each color)
  { id: "organ_red_1", type: "organ", color: "red" },
  { id: "organ_red_2", type: "organ", color: "red" },
  { id: "organ_red_3", type: "organ", color: "red" },
  { id: "organ_red_4", type: "organ", color: "red" },
  { id: "organ_red_5", type: "organ", color: "red" },

  { id: "organ_green_1", type: "organ", color: "green" },
  { id: "organ_green_2", type: "organ", color: "green" },
  { id: "organ_green_3", type: "organ", color: "green" },
  { id: "organ_green_4", type: "organ", color: "green" },
  { id: "organ_green_5", type: "organ", color: "green" },

  { id: "organ_blue_1", type: "organ", color: "blue" },
  { id: "organ_blue_2", type: "organ", color: "blue" },
  { id: "organ_blue_3", type: "organ", color: "blue" },
  { id: "organ_blue_4", type: "organ", color: "blue" },
  { id: "organ_blue_5", type: "organ", color: "blue" },

  { id: "organ_yellow_1", type: "organ", color: "yellow" },
  { id: "organ_yellow_2", type: "organ", color: "yellow" },
  { id: "organ_yellow_3", type: "organ", color: "yellow" },
  { id: "organ_yellow_4", type: "organ", color: "yellow" },
  { id: "organ_yellow_5", type: "organ", color: "yellow" },

  // Rainbow organ (1)
  { id: "organ_rainbow_1", type: "organ", color: "rainbow" },

  // Bacteria (4 for each color)
  { id: "bacteria_red_1", type: "bacteria", color: "red" },
  { id: "bacteria_red_2", type: "bacteria", color: "red" },
  { id: "bacteria_red_3", type: "bacteria", color: "red" },
  { id: "bacteria_red_4", type: "bacteria", color: "red" },

  { id: "bacteria_green_1", type: "bacteria", color: "green" },
  { id: "bacteria_green_2", type: "bacteria", color: "green" },
  { id: "bacteria_green_3", type: "bacteria", color: "green" },
  { id: "bacteria_green_4", type: "bacteria", color: "green" },

  { id: "bacteria_blue_1", type: "bacteria", color: "blue" },
  { id: "bacteria_blue_2", type: "bacteria", color: "blue" },
  { id: "bacteria_blue_3", type: "bacteria", color: "blue" },
  { id: "bacteria_blue_4", type: "bacteria", color: "blue" },

  { id: "bacteria_yellow_1", type: "bacteria", color: "yellow" },
  { id: "bacteria_yellow_2", type: "bacteria", color: "yellow" },
  { id: "bacteria_yellow_3", type: "bacteria", color: "yellow" },
  { id: "bacteria_yellow_4", type: "bacteria", color: "yellow" },

  // Rainbow bacteria (1)
  { id: "bacteria_rainbow_1", type: "bacteria", color: "rainbow" },

  // Medicines (4 for each color)
  { id: "medicine_red_1", type: "medicine", color: "red" },
  { id: "medicine_red_2", type: "medicine", color: "red" },
  { id: "medicine_red_3", type: "medicine", color: "red" },
  { id: "medicine_red_4", type: "medicine", color: "red" },

  { id: "medicine_green_1", type: "medicine", color: "green" },
  { id: "medicine_green_2", type: "medicine", color: "green" },
  { id: "medicine_green_3", type: "medicine", color: "green" },
  { id: "medicine_green_4", type: "medicine", color: "green" },

  { id: "medicine_blue_1", type: "medicine", color: "blue" },
  { id: "medicine_blue_2", type: "medicine", color: "blue" },
  { id: "medicine_blue_3", type: "medicine", color: "blue" },
  { id: "medicine_blue_4", type: "medicine", color: "blue" },

  { id: "medicine_yellow_1", type: "medicine", color: "yellow" },
  { id: "medicine_yellow_2", type: "medicine", color: "yellow" },
  { id: "medicine_yellow_3", type: "medicine", color: "yellow" },
  { id: "medicine_yellow_4", type: "medicine", color: "yellow" },

  // Rainbow medicine (1)
  { id: "medicine_rainbow_1", type: "medicine", color: "rainbow" },

  // Treatments
  { id: "transplant_1", type: "treatment", color: "transplant" },
  { id: "transplant_2", type: "treatment", color: "transplant" },

  { id: "organ_thief_1", type: "treatment", color: "organ_thief" },
  { id: "organ_thief_2", type: "treatment", color: "organ_thief" },
  { id: "organ_thief_3", type: "treatment", color: "organ_thief" },

  { id: "contagion_1", type: "treatment", color: "contagion" },
  { id: "contagion_2", type: "treatment", color: "contagion" },
  { id: "contagion_3", type: "treatment", color: "contagion" },

  { id: "latex_glove_1", type: "treatment", color: "latex_glove" },

  { id: "medical_error_1", type: "treatment", color: "medical_error" },
];
