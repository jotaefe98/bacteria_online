import React from "react";
import type { Card as CardType } from "../../interfaces/game/gameInterfaces";
import "./Card.css";

type CardProps = {
  card: CardType;
  isSelected?: boolean;
  onClick?: () => void;
  disabled?: boolean;
};

const Card: React.FC<CardProps> = ({
  card,
  isSelected = false,
  onClick,
  disabled = false,
}) => {
  const getCardIcon = (type: CardType["type"], color: string) => {
    switch (type) {
      case "organ":
        return getOrganIcon(color);
      case "virus":
        return "🦠";
      case "medicine":
        return "💉";
      case "treatment":
        return getTreatmentIcon(color);
      default:
        return "❓";
    }
  };

  const getOrganIcon = (color: string) => {
    switch (color.toLowerCase()) {
      case "red":
        return "❤️"; // Heart
      case "green":
        return "🫁"; // Lungs
      case "blue":
        return "🧠"; // Brain
      case "yellow":
        return "🦴"; // Bone
      case "rainbow":
        return "🌈"; // Rainbow organ
      default:
        return "🫀"; // Generic organ
    }
  };

  const getTreatmentIcon = (color: string) => {
    switch (color.toLowerCase()) {
      case "transplant":
        return "🔄";
      case "organ_thief":
        return "🦹";
      case "contagion":
        return "☣️";
      case "latex_glove":
        return "🧤";
      case "medical_error":
        return "💥";
      default:
        return "🧪";
    }
  };

  const getCardColorClass = (color: string) => {
    switch (color.toLowerCase()) {
      case "red":
        return "card-red";
      case "green":
        return "card-green";
      case "blue":
        return "card-blue";
      case "yellow":
        return "card-yellow";
      case "rainbow":
        return "card-rainbow";
      default:
        return "card-default";
    }
  };

  return (
    <div
      className={`game-card ${getCardColorClass(card.color)} ${
        isSelected ? "selected" : ""
      } ${disabled ? "disabled" : ""}`}
      onClick={!disabled ? onClick : undefined}
    >
      <div className="card-icon-center">
        {getCardIcon(card.type, card.color)}
      </div>

      <div className="card-color-display">{card.color.toUpperCase()}</div>
    </div>
  );
};

export default Card;
