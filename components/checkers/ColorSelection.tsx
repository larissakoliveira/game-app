import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { PlayerColor } from './types';

interface ColorSelectionProps {
  onSelectColors: (player1Color: PlayerColor, player2Color: PlayerColor) => void;
}

const AVAILABLE_COLORS: PlayerColor[] = ['red', 'black', 'blue', 'green'];

export const ColorSelection: React.FC<ColorSelectionProps> = ({ onSelectColors }) => {
  const [player1Color, setPlayer1Color] = React.useState<PlayerColor | null>(null);

  const handleColorSelect = (color: PlayerColor) => {
    if (!player1Color) {
      setPlayer1Color(color);
    } else {
      if (color !== player1Color) {
        onSelectColors(player1Color, color);
      }
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        {!player1Color ? "Player 1: Choose your color" : "Player 2: Choose your color"}
      </Text>
      <View style={styles.colorGrid}>
        {AVAILABLE_COLORS.map((color) => (
          <TouchableOpacity
            key={color}
            style={[
              styles.colorButton,
              { backgroundColor: color },
              color === player1Color && styles.selectedColor,
              player1Color && color === player1Color && styles.disabledColor,
            ]}
            onPress={() => handleColorSelect(color)}
            disabled={player1Color === color}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: 'center',
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 20,
  },
  colorButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    margin: 10,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  selectedColor: {
    borderWidth: 4,
    borderColor: '#fff',
  },
  disabledColor: {
    opacity: 0.5,
  },
});
