import React, { useState, useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import { ColorSelection } from './ColorSelection';
import { GameBoard } from './GameBoard';
import { PlayerColor, GameState, Player } from './types';
import { initializeBoard } from './gameLogic';

export const Checkers: React.FC = () => {
  const [gameState, setGameState] = useState<GameState | null>(null);

  const handleColorSelection = useCallback((player1Color: PlayerColor, player2Color: PlayerColor) => {
    const players: [Player, Player] = [
      { id: 1, color: player1Color, score: 0 },
      { id: 2, color: player2Color, score: 0 }
    ];
    
    const initialState = initializeBoard(players);
    setGameState(initialState);
  }, []);

  return (
    <View style={styles.container}>
      {!gameState ? (
        <ColorSelection onSelectColors={handleColorSelection} />
      ) : (
        <GameBoard
          gameState={gameState}
          onGameStateChange={setGameState}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
});
