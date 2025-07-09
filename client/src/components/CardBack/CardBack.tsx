import React from "react";
import "../Card/Card.css";

interface CardBackProps {
  count?: number;
  size?: "small" | "medium" | "large";
}

const CardBack: React.FC<CardBackProps> = ({ count, size = "medium" }) => {
  return (
    <div className={`card-back ${size}`}>
      <div className="card-back-content">
        <div className="virus-logo">🦠</div>
        <div className="card-back-title">VIRUS!</div>
        <div className="card-back-pattern">
          <div className="pattern-element">💉</div>
          <div className="pattern-element">🫀</div>
          <div className="pattern-element">🧪</div>
        </div>
        {count && count > 1 && (
          <div className="card-count">
            <span className="count-badge">{count}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default CardBack;
