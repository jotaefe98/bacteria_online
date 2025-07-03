import React from 'react'
import Card from '../Card/Card'
import CardBack from '../CardBack/CardBack'
import './Board.css'

type BoardProps = {
  myCards: (string | number)[]
  opponentCards: number
}

const Board: React.FC<BoardProps> = ({ myCards, opponentCards }) => (
  <div className="board-vertical">
    <div className="board-row">
      {[...Array(opponentCards)].map((_, idx) => (
        <CardBack key={idx} />
      ))}
    </div>
    <div className="board-row">
      {myCards.map((value, idx) => (
        <Card key={idx} value={value} />
      ))}
    </div>
  </div>
)

export default Board