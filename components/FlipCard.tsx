
import React from 'react';

interface FlipCardProps {
  digit: string | number;
  label?: string;
}

const FlipCard: React.FC<FlipCardProps> = ({ digit, label }) => {
  return (
    <div className="countdown-item">
      <div className="nums">
        <div className="num-half num-top">{digit}</div>
        <div className="num-half num-bottom">{digit}</div>
      </div>
      {label && <span className="countdown-label">{label}</span>}
    </div>
  );
};

export default FlipCard;
