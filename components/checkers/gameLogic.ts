import { GameState, Piece, Position, Move, Player } from './types';

const BOARD_SIZE = 8;

export const initializeBoard = (players: [Player, Player]): GameState => {
  const board: (Piece | null)[][] = Array(BOARD_SIZE).fill(null)
    .map(() => Array(BOARD_SIZE).fill(null));
  
  // Initialize pieces for both players
  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      if ((row + col) % 2 === 1) {
        if (row < 3) {
          board[row][col] = {
            id: `p1-${row}-${col}`,
            playerId: players[0].id,
            isKing: false,
            position: { row, col }
          };
        } else if (row > 4) {
          board[row][col] = {
            id: `p2-${row}-${col}`,
            playerId: players[1].id,
            isKing: false,
            position: { row, col }
          };
        }
      }
    }
  }

  return {
    board,
    players,
    currentTurn: players[0].id,
    selectedPiece: null,
    validMoves: [],
  };
};

export const getValidMoves = (
  piece: Piece,
  board: (Piece | null)[][],
): Move[] => {
  const moves: Move[] = [];
  
  // Get both regular moves and capture moves
  const captureMoves = getCaptureMoves(piece, board);
  const regularMoves: Move[] = [];

  if (piece.isKing) {
    // For kings, check all diagonal directions
    [-1, 1].forEach(dirRow => {
      [-1, 1].forEach(dirCol => {
        const newRow = piece.position.row + dirRow;
        const newCol = piece.position.col + dirCol;
        
        if (isValidPosition(newRow, newCol) && !board[newRow][newCol]) {
          regularMoves.push({
            from: piece.position,
            to: { row: newRow, col: newCol }
          });
        }
      });
    });
  } else {
    // Regular piece movement - one square forward only
    const directions = piece.playerId === 1 ? [1] : [-1];
    directions.forEach(dirRow => {
      [-1, 1].forEach(dirCol => {
        const newRow = piece.position.row + dirRow;
        const newCol = piece.position.col + dirCol;
        
        if (isValidPosition(newRow, newCol) && !board[newRow][newCol]) {
          regularMoves.push({
            from: piece.position,
            to: { row: newRow, col: newCol }
          });
        }
      });
    });
  }

  // Return all possible moves - both captures and regular moves
  return [...regularMoves, ...captureMoves];
};

const getCaptureMoves = (piece: Piece, board: (Piece | null)[][], currentPath: Position[] = []): Move[] => {
  const moves: Move[] = [];

  if (piece.isKing) {
    // Function to check a specific diagonal direction for captures
    const checkDiagonalForCaptures = (
      startPos: Position,
      dirRow: number,
      dirCol: number,
      capturedPieces: Array<{ position: Position; piece: Piece }> = []
    ): Move[] => {
      const diagonalMoves: Move[] = [];
      let distance = 1;
      let foundOpponent = false;
      let opponentPosition: Position | null = null;
      let opponentPiece: Piece | null = null;

      while (true) {
        const checkRow = startPos.row + (dirRow * distance);
        const checkCol = startPos.col + (dirCol * distance);

        if (!isValidPosition(checkRow, checkCol)) break;

        const checkPiece = board[checkRow][checkCol];

        if (!foundOpponent) {
          if (checkPiece) {
            if (checkPiece.playerId !== piece.playerId) {
              // Found an opponent piece
              foundOpponent = true;
              opponentPosition = { row: checkRow, col: checkCol };
              opponentPiece = checkPiece;
            } else {
              break; // Found own piece, stop looking in this direction
            }
          }
        } else {
          // We've found an opponent piece, now looking for landing spots
          if (!checkPiece && !currentPath.some(pos => pos.row === checkRow && pos.col === checkCol)) {
            // Create a temporary board for checking additional captures
            const tempBoard = board.map(row => [...row]);
            
            // Remove the captured piece and update piece position
            tempBoard[opponentPosition!.row][opponentPosition!.col] = null;
            tempBoard[startPos.row][startPos.col] = null;
            tempBoard[checkRow][checkCol] = { ...piece, position: { row: checkRow, col: checkCol } };

            // Record this capture
            const newCapturedPieces = [
              ...capturedPieces,
              { position: opponentPosition!, piece: opponentPiece! }
            ];

            // Create the move for this capture
            const move: Move = {
              from: piece.position,
              to: { row: checkRow, col: checkCol },
              capturedPiece: opponentPiece!,
              additionalCaptures: capturedPieces
            };
            diagonalMoves.push(move);

            // Check for additional captures from this new position
            const newPath = [...currentPath, { row: checkRow, col: checkCol }];
            
            // Check all diagonal directions from the new position
            [-1, 1].forEach(newDirRow => {
              [-1, 1].forEach(newDirCol => {
                // Don't check the direction we came from immediately
                if (!(newDirRow === -dirRow && newDirCol === -dirCol)) {
                  const additionalMoves = checkDiagonalForCaptures(
                    { row: checkRow, col: checkCol },
                    newDirRow,
                    newDirCol,
                    newCapturedPieces
                  );
                  diagonalMoves.push(...additionalMoves);
                }
              });
            });
          } else if (checkPiece) {
            break; // Found another piece after opponent, stop looking
          }
        }
        distance++;
      }
      return diagonalMoves;
    };

    // Check all initial diagonal directions for the king
    [-1, 1].forEach(dirRow => {
      [-1, 1].forEach(dirCol => {
        const directionMoves = checkDiagonalForCaptures(piece.position, dirRow, dirCol);
        moves.push(...directionMoves);
      });
    });
  } else {
    // Regular piece capture logic - one square jumps only
    const directions = piece.playerId === 1 ? [1] : [-1];
    directions.forEach(dirRow => {
      [-1, 1].forEach(dirCol => {
        const midRow = piece.position.row + dirRow;
        const midCol = piece.position.col + dirCol;
        const jumpRow = midRow + dirRow;
        const jumpCol = midCol + dirCol;

        if (isValidPosition(midRow, midCol) && isValidPosition(jumpRow, jumpCol)) {
          const targetPiece = board[midRow][midCol];
          if (
            targetPiece && 
            targetPiece.playerId !== piece.playerId && 
            !board[jumpRow][jumpCol]
          ) {
            moves.push({
              from: piece.position,
              to: { row: jumpRow, col: jumpCol },
              capturedPiece: targetPiece
            });
          }
        }
      });
    });
  }

  return moves;
};

const isValidPosition = (row: number, col: number): boolean => {
  return row >= 0 && row < BOARD_SIZE && col >= 0 && col < BOARD_SIZE;
};

export const makeMove = (
  gameState: GameState,
  move: Move
): GameState => {
  const newBoard = gameState.board.map(row => [...row]);
  const movingPiece = newBoard[move.from.row][move.from.col];

  if (!movingPiece) return gameState;

  // Clear the starting position
  newBoard[move.from.row][move.from.col] = null;

  // Handle captures
  if (move.capturedPiece) {
    newBoard[move.capturedPiece.position.row][move.capturedPiece.position.col] = null;
    
    // Handle additional captures for multiple jumps
    if (move.additionalCaptures) {
      move.additionalCaptures.forEach(capture => {
        newBoard[capture.position.row][capture.position.col] = null;
      });
    }
  }

  // Update piece position
  const updatedPiece = {
    ...movingPiece,
    position: move.to,
    isKing: movingPiece.isKing || 
            (movingPiece.playerId === 1 && move.to.row === BOARD_SIZE - 1) ||
            (movingPiece.playerId === 2 && move.to.row === 0)
  };
  
  newBoard[move.to.row][move.to.col] = updatedPiece;

  // Update game state
  return {
    ...gameState,
    board: newBoard,
    currentTurn: gameState.currentTurn === gameState.players[0].id 
      ? gameState.players[1].id 
      : gameState.players[0].id,
    selectedPiece: null,
    validMoves: [],
  };
};

export const checkGameOver = (gameState: GameState): Player | null => {
  const hasPlayerPieces = (playerId: number): boolean => {
    return gameState.board.some(row =>
      row.some(piece => piece?.playerId === playerId)
    );
  };

  const hasValidMoves = (playerId: number): boolean => {
    for (let row = 0; row < BOARD_SIZE; row++) {
      for (let col = 0; col < BOARD_SIZE; col++) {
        const piece = gameState.board[row][col];
        if (piece && piece.playerId === playerId) {
          const moves = getValidMoves(piece, gameState.board);
          if (moves.length > 0) {
            return true;
          }
        }
      }
    }
    return false;
  };

  // Check if any player has no pieces
  if (!hasPlayerPieces(gameState.players[0].id)) {
    return gameState.players[1];
  }
  if (!hasPlayerPieces(gameState.players[1].id)) {
    return gameState.players[0];
  }

  // Check if current player has no valid moves
  if (!hasValidMoves(gameState.currentTurn)) {
    return gameState.players.find(p => p.id !== gameState.currentTurn) || null;
  }

  return null;
};
