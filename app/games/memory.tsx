import React from 'react';
import { StyleSheet } from 'react-native';
import { Stack } from 'expo-router';
import { ThemedView } from '@/components/ThemedView';
import { MemoryGame } from '@/components/memory/MemoryGame';

export default function MemoryScreen() {
  return (
    <ThemedView style={styles.container}>
      <Stack.Screen 
        options={{
          title: 'Memory Game',
        }}
      />
      <MemoryGame />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
});
