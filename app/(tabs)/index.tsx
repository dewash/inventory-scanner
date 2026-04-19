import { type Href, useRouter } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { ScreenContainer, Title, useAppPalette } from '@/components/ui';
import { spacing } from '@/constants/design-system';

export default function HomeScreen() {
  const router = useRouter();
  const colors = useAppPalette();

  return (
    <ScreenContainer scrollable={false} style={styles.screenRoot}>
      <View style={styles.split}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Scan item"
          onPress={() => router.push('/scanner')}
          style={({ pressed }) => [
            styles.half,
            {
              backgroundColor: colors.surfaceElevated,
              borderColor: colors.borderSubtle,
              opacity: pressed ? 0.92 : 1,
            },
          ]}>
          <View style={[styles.iconCircle, { backgroundColor: colors.accentMuted }]}>
            <IconSymbol name="camera.fill" size={40} color={colors.accent} />
          </View>
          <Title style={styles.actionTitle}>Scan item</Title>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="View items"
          onPress={() => router.push('/items' as Href)}
          style={({ pressed }) => [
            styles.half,
            {
              backgroundColor: colors.surfaceElevated,
              borderColor: colors.borderSubtle,
              opacity: pressed ? 0.92 : 1,
            },
          ]}>
          <View style={[styles.iconCircle, { backgroundColor: colors.accentMuted }]}>
            <IconSymbol name="shippingbox.fill" size={40} color={colors.accent} />
          </View>
          <Title style={styles.actionTitle}>View items</Title>
        </Pressable>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  screenRoot: {
    flex: 1,
  },
  split: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
    gap: spacing.lg,
  },
  half: {
    flex: 1,
    borderRadius: 20,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.lg,
  },
  iconCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionTitle: {
    fontSize: 22,
    letterSpacing: -0.3,
  },
});
