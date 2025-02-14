import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Pressable, Animated, Dimensions, Platform } from 'react-native';
import { ThemedText } from '../ThemedText';
import { ThemedView } from '../ThemedView';
import { IconSymbol } from '../ui/IconSymbol';

// Memory card icons
const CARD_ICONS = [
  'heart.fill',
  'star.fill',
  'moon.fill',
  'cloud.fill',
  'bolt.fill',
  'leaf.fill',
  'flame.fill',
  'drop.fill',
];

interface Card {
  id: number;
  icon: string;
  isFlipped: boolean;
  isMatched: boolean;
}

const createCards = () => {
  const cards: Card[] = [];
  CARD_ICONS.forEach((icon, index) => {
    // Create pairs of cards
    cards.push(
      { id: index * 2, icon, isFlipped: false, isMatched: false },
      { id: index * 2 + 1, icon, isFlipped: false, isMatched: false }
    );
  });
  // Shuffle cards
  return cards.sort(() => Math.random() - 0.5);
};

export function MemoryGame() {
  const [cards, setCards] = useState<Card[]>(createCards());
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [matches, setMatches] = useState(0);
  const [isGameComplete, setIsGameComplete] = useState(false);
  const [flipAnimations] = useState(() =>
    cards.map(() => new Animated.Value(0))
  );

  const flipCard = (cardId: number) => {
    if (
      flippedCards.length === 2 ||
      flippedCards.includes(cardId) ||
      cards[cardId].isMatched
    ) {
      return;
    }

    const newFlippedCards = [...flippedCards, cardId];
    setFlippedCards(newFlippedCards);

    // Animate card flip
    Animated.spring(flipAnimations[cardId], {
      toValue: 1,
      friction: 8,
      tension: 10,
      useNativeDriver: true,
    }).start();

    if (newFlippedCards.length === 2) {
      setMoves(moves + 1);
      const [firstCard, secondCard] = newFlippedCards;
      
      if (cards[firstCard].icon === cards[secondCard].icon) {
        // Match found
        setCards(cards.map((card, index) =>
          index === firstCard || index === secondCard
            ? { ...card, isMatched: true }
            : card
        ));
        setMatches(matches + 1);
        setFlippedCards([]);
        
        if (matches + 1 === CARD_ICONS.length) {
          setIsGameComplete(true);
        }
      } else {
        // No match, flip cards back
        setTimeout(() => {
          Animated.parallel(
            newFlippedCards.map(id =>
              Animated.spring(flipAnimations[id], {
                toValue: 0,
                friction: 8,
                tension: 10,
                useNativeDriver: true,
              })
            )
          ).start();
          setFlippedCards([]);
        }, 1000);
      }
    }
  };

  const resetGame = () => {
    // Reset all animations
    flipAnimations.forEach(anim => anim.setValue(0));
    setCards(createCards());
    setFlippedCards([]);
    setMoves(0);
    setMatches(0);
    setIsGameComplete(false);
  };

  const renderCard = (card: Card, index: number) => {
    const flipAnimation = flipAnimations[index];
    const frontInterpolate = flipAnimation.interpolate({
      inputRange: [0, 1],
      outputRange: ['180deg', '360deg'],
    });
    const backInterpolate = flipAnimation.interpolate({
      inputRange: [0, 1],
      outputRange: ['0deg', '180deg'],
    });

    const frontAnimatedStyle = {
      transform: [{ rotateY: frontInterpolate }],
    };
    const backAnimatedStyle = {
      transform: [{ rotateY: backInterpolate }],
    };

    return (
      <Pressable
        key={card.id}
        onPress={() => flipCard(index)}
        style={styles.cardContainer}
      >
        <View style={[styles.card, card.isMatched && styles.matchedCard]}>
          <Animated.View style={[styles.cardFace, styles.cardBack, backAnimatedStyle]}>
            <IconSymbol name="questionmark.circle.fill" size={40} color="#808080" />
          </Animated.View>
          <Animated.View style={[styles.cardFace, styles.cardFront, frontAnimatedStyle]}>
            <IconSymbol name={card.icon} size={40} color="#4A90E2" />
          </Animated.View>
        </View>
      </Pressable>
    );
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.header}>
        <ThemedText style={styles.stats}>Moves: {moves}</ThemedText>
        <ThemedText style={styles.stats}>Matches: {matches}</ThemedText>
      </ThemedView>
      
      <View style={styles.grid}>
        {cards.map((card, index) => renderCard(card, index))}
      </View>

      {isGameComplete && (
        <ThemedView style={styles.gameComplete}>
          <ThemedText style={styles.gameCompleteText}>
            Congratulations! 🎉{'\n'}
            You completed the game in {moves} moves!
          </ThemedText>
          <Pressable style={styles.resetButton} onPress={resetGame}>
            <ThemedText style={styles.resetButtonText}>Play Again</ThemedText>
          </Pressable>
        </ThemedView>
      )}

      {!isGameComplete && (
        <Pressable style={styles.resetButton} onPress={resetGame}>
          <ThemedText style={styles.resetButtonText}>Reset Game</ThemedText>
        </Pressable>
      )}
    </ThemedView>
  );
}

const { width } = Dimensions.get('window');
const CARD_SIZE = (width - 60) / 4;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  stats: {
    fontSize: 18,
    fontWeight: '600',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
  },
  cardContainer: {
    width: CARD_SIZE,
    height: CARD_SIZE,
    margin: 4,
  },
  card: {
    flex: 1,
    position: 'relative',
  },
  cardFace: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backfaceVisibility: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
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
  cardFront: {
    backgroundColor: '#ffffff',
  },
  cardBack: {
    backgroundColor: '#f0f0f0',
  },
  matchedCard: {
    opacity: 0.7,
  },
  gameComplete: {
    position: 'absolute',
    top: '40%',
    left: 20,
    right: 20,
    padding: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 16,
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  gameCompleteText: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  resetButton: {
    marginTop: 20,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#4A90E2',
    borderRadius: 8,
  },
  resetButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
