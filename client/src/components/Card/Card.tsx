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
  const getCardIcon = (type: CardType["type"]) => {
    switch (type) {
      case "organ":
        return "🫀";
      case "virus":
        return "🦠";
      case "medicine":
        return "💉";
      case "treatment":
        return "🧪";
      default:
        return "❓";
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

  const getCardDescription = () => {
    switch (card.type) {
      case "organ":
        return `${card.color} organ`;
      case "virus":
        return `${card.color} virus`;
      case "medicine":
        return `${card.color} medicine`;
      case "treatment":
        return card.color === "rainbow"
          ? "Universal treatment"
          : `${card.color} treatment`;
      default:
        return "Unknown card";
    }
  };

  return (
    <div
      className={`game-card ${getCardColorClass(card.color)} ${
        isSelected ? "selected" : ""
      } ${disabled ? "disabled" : ""}`}
      onClick={!disabled ? onClick : undefined}
    >
      <div className="card-header">
        <div className="card-icon">{getCardIcon(card.type)}</div>
        <div className="card-type">{card.type.toUpperCase()}</div>
      </div>

      <div className="card-body">
        <div className="card-color-display">{card.color.toUpperCase()}</div>
      </div>

      <div className="card-footer">
        <div className="card-description">{getCardDescription()}</div>
      </div>
    </div>
  );
};

export default Card;
