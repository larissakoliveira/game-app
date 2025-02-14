export type PlayerColor = 'red' | 'black' | 'blue' | 'green';

export interface Player {
  id: number;
  color: PlayerColor;
  score: number;
}

export interface Piece {
  id: string;
  playerId: number;
  isKing: boolean;
  position: Position;
}

export interface Position {
  row: number;
  col: number;
}

export interface GameState {
  board: (Piece | null)[][];
  players: [Player, Player];
  currentTurn: number;
  selectedPiece: Piece | null;
  validMoves: Position[];
}

export interface Move {
  from: Position;
  to: Position;
  capturedPiece?: Piece;
  additionalCaptures?: Array<{
    position: Position;
    piece: Piece;
  }>;
}
