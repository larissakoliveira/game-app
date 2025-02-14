import React from 'react';
import { StyleSheet } from 'react-native';
import { Stack } from 'expo-router';
import { ThemedView } from '@/components/ThemedView';
import { Checkers as CheckersGame } from '@/components/checkers/Checkers';

export default function CheckersScreen() {
  return (
    <ThemedView style={styles.container}>
      <Stack.Screen 
        options={{
          title: 'Checkers',
        }}
      />
      <CheckersGame />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
});
