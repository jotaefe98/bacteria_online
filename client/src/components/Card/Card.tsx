import React from 'react';
import './Card.css';

type CardProps = {
    value: string | number;
}

const Card: React.FC<CardProps> = ({ value }) => {
    return (
        <div className="card">
            <div className="card-content">
                {value}
            </div>
        </div>
    );
};

export default Card;