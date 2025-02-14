import React, { useCallback, useMemo } from 'react';
import { View, TouchableOpacity, StyleSheet, Text, Dimensions } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { GameState, Piece, Position, Player, Move } from './types';
import { getValidMoves, makeMove, checkGameOver } from './gameLogic';

interface GameBoardProps {
  gameState: GameState;
  onGameStateChange: (newState: GameState) => void;
}

export const GameBoard: React.FC<GameBoardProps> = ({
  gameState,
  onGameStateChange,
}) => {
  const handleSquarePress = useCallback((row: number, col: number) => {
    const piece = gameState.board[row][col];
    const selectedPiece = gameState.selectedPiece;

    // If there's a selected piece and the clicked position is a valid move
    if (selectedPiece && gameState.validMoves.some(move => 
      move.to.row === row && move.to.col === col
    )) {
      const move = gameState.validMoves.find(move =>
        move.to.row === row && move.to.col === col
      );
      if (move) {
        const newState = makeMove(gameState, move);
        const gameOver = checkGameOver(newState);
        onGameStateChange({
          ...newState,
          selectedPiece: null,
          validMoves: [],
          winner: gameOver,
        });
      }
      return;
    }

    // If clicking on a piece that belongs to the current player
    if (piece && piece.playerId === gameState.currentTurn) {
      const validMoves = getValidMoves(piece, gameState.board);
      if (validMoves.length > 0) {
        onGameStateChange({
          ...gameState,
          selectedPiece: piece,
          validMoves,
        });
      }
      return;
    }

    // Clear selection if clicking elsewhere
    if (gameState.selectedPiece) {
      onGameStateChange({
        ...gameState,
        selectedPiece: null,
        validMoves: [],
      });
    }
  }, [gameState, onGameStateChange]);

  const renderSquare = useCallback((row: number, col: number) => {
    const piece = gameState.board[row][col];
    const isSelected = gameState.selectedPiece?.position.row === row && 
                      gameState.selectedPiece?.position.col === col;
    const isValidMove = gameState.validMoves.some(
      move => move.to.row === row && move.to.col === col
    );
    const squareColor = (row + col) % 2 === 0 ? '#E8E8E8' : '#8B4513';

    return (
      <TouchableOpacity
        key={`${row}-${col}`}
        style={[
          styles.square,
          { backgroundColor: squareColor },
          isSelected && styles.selectedSquare,
          isValidMove && styles.validMoveSquare,
        ]}
        onPress={() => handleSquarePress(row, col)}
        activeOpacity={0.7}
      >
        {piece && (
          <MaterialCommunityIcons
            name={piece.isKing ? 'crown' : 'checkerboard'}
            size={24}
            color={piece.playerId === 1 ? '#FF0000' : '#000000'}
          />
        )}
        {isValidMove && (
          <View style={styles.validMoveIndicator} />
        )}
      </TouchableOpacity>
    );
  }, [gameState, handleSquarePress]);

  const board = useMemo(() => {
    return Array(8).fill(null).map((_, row) => (
      <View key={row} style={styles.row}>
        {Array(8).fill(null).map((_, col) => renderSquare(row, col))}
      </View>
    ));
  }, [renderSquare]);

  return (
    <View style={styles.container}>
      <View style={styles.boardContainer}>
        {board}
      </View>
      {gameState.winner && (
        <View style={styles.winnerOverlay}>
          <Text style={styles.winnerText}>
            Player {gameState.winner.id} Wins!
          </Text>
        </View>
      )}
    </View>
  );
};

const { width } = Dimensions.get('window');
const SQUARE_SIZE = Math.min(width - 32, 400) / 8;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  boardContainer: {
    padding: 8,
    backgroundColor: '#DEB887',
    borderRadius: 8,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  row: {
    flexDirection: 'row',
  },
  square: {
    width: SQUARE_SIZE,
    height: SQUARE_SIZE,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  selectedSquare: {
    backgroundColor: 'rgba(255, 255, 0, 0.3) !important',
  },
  validMoveSquare: {
    backgroundColor: 'rgba(0, 255, 0, 0.2) !important',
  },
  validMoveIndicator: {
    position: 'absolute',
    width: SQUARE_SIZE * 0.3,
    height: SQUARE_SIZE * 0.3,
    borderRadius: SQUARE_SIZE * 0.15,
    backgroundColor: 'rgba(0, 255, 0, 0.3)',
  },
  winnerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  winnerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
  },
});
