import { Stack } from 'expo-router';
import React from 'react';

export default function GamesLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerBackTitle: 'Back',
      }}
    />
  );
}
