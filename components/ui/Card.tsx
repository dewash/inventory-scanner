import React from 'react';
import { Platform, StyleSheet, View, type ViewProps } from 'react-native';

import { radii, spacing } from '@/constants/design-system';

import { useAppPalette } from './use-app-palette';

export type CardProps = ViewProps & {
  padded?: boolean;
};

export function Card({ style, padded = true, children, ...rest }: CardProps) {
  const colors = useAppPalette();

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.surfaceElevated,
          borderColor: colors.borderSubtle,
          shadowColor: colors.shadow,
        },
        padded && styles.padded,
        style,
      ]}
      {...rest}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radii.lg,
    borderWidth: StyleSheet.hairlineWidth,
    ...Platform.select({
      ios: {
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.22,
        shadowRadius: 24,
      },
      android: {
        elevation: 6,
      },
      default: {
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.18,
        shadowRadius: 20,
      },
    }),
  },
  padded: {
    padding: spacing.lg,
  },
});
