type TypeCard = 'virus' | 'organ' | 'medicine' | 'treatment' ;
type ColorCard = 'red' | 'green' | 'blue' | 'yellow' | 'rainbow' |  'transplant' | 'organ_thief' | 'contagion' | 'latex_glove' | 'medical_error';


export interface Card {
    id: string;
    type: TypeCard;
    color: ColorCard;
}

export interface GameState {
    deck: Card[];
    hands: { [playerId: string]: Card[] };
    table: { [playerId: string]: Card[] };
    currentTurn: string;
    phase: 'draw' | 'play' | 'end';
}