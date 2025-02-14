import { StyleSheet, Image, Platform, Pressable } from 'react-native';
import { Link } from 'expo-router';

import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';

const GAMES = [
  {
    id: 'checkers',
    title: 'Checkers',
    icon: 'gamecontroller.fill',
    description: 'Classic board game for two players',
  },
  {
    id: 'memory',
    title: 'Memory Game',
    icon: 'brain.head.profile',
    description: 'Test your memory by matching pairs of cards',
  },
  // More games can be added here later
];

export default function TabTwoScreen() {
  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#D0D0D0', dark: '#353636' }}
      headerImage={
        <IconSymbol
          size={310}
          color="#808080"
          name="gamecontroller.fill"
          style={styles.headerImage}
        />
      }>
      <ThemedView style={styles.container}>
        <ThemedText style={styles.title}>Available Games</ThemedText>
        {GAMES.map((game) => (
          <Link key={game.id} href={`/games/${game.id}`} asChild>
            <Pressable>
              {({ pressed }) => (
                <ThemedView style={[styles.gameCard, pressed && styles.pressed]}>
                  <IconSymbol name={game.icon} size={24} color="#808080" />
                  <ThemedView style={styles.gameInfo}>
                    <ThemedText style={styles.gameTitle}>{game.title}</ThemedText>
                    <ThemedText style={styles.gameDescription}>{game.description}</ThemedText>
                  </ThemedView>
                  <IconSymbol name="chevron.right" size={20} color="#808080" />
                </ThemedView>
              )}
            </Pressable>
          </Link>
        ))}
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  headerImage: {
    color: '#808080',
    bottom: -90,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  gameCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
    backgroundColor: Platform.select({
      ios: 'rgba(255, 255, 255, 0.8)',
      default: '#fff',
    }),
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  pressed: {
    opacity: 0.7,
  },
  gameInfo: {
    flex: 1,
    marginLeft: 12,
  },
  gameTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  gameDescription: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
});
