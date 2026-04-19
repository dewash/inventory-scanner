import { Stack } from 'expo-router';
import React from 'react';

import { palette } from '@/constants/design-system';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function ItemsStackLayout() {
  const colorScheme = useColorScheme() ?? 'dark';
  const theme = colorScheme === 'light' ? palette.light : palette.dark;

  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerStyle: { backgroundColor: theme.surface },
        headerTintColor: theme.textPrimary,
        headerTitleStyle: { fontWeight: '600', fontSize: 17 },
        headerShadowVisible: false,
      }}>
      <Stack.Screen name="index" options={{ title: 'Recorded items' }} />
      <Stack.Screen name="edit/[barcode]" options={{ title: 'Edit item' }} />
    </Stack>
  );
}
