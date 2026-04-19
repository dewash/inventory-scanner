import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, type PressableProps } from 'react-native';

import { radii, spacing, typography } from '@/constants/design-system';

import { useAppPalette } from './use-app-palette';

export type PrimaryButtonProps = PressableProps & {
  title: string;
  loading?: boolean;
};

export function PrimaryButton({ title, loading, disabled, style, ...rest }: PrimaryButtonProps) {
  const colors = useAppPalette();
  const isDisabled = disabled || loading;

  return (
    <Pressable
      accessibilityRole="button"
      disabled={isDisabled}
      style={(state) => {
        const extra = typeof style === 'function' ? style(state) : style;
        return [
          styles.base,
          {
            backgroundColor: colors.accent,
            opacity: isDisabled ? 0.5 : state.pressed ? 0.92 : 1,
          },
          extra,
        ];
      }}
      {...rest}>
      {loading ? (
        <ActivityIndicator color="#ffffff" />
      ) : (
        <Text style={[styles.label, { color: '#ffffff' }]}>{title}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 48,
    paddingHorizontal: spacing.xl,
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    ...typography.subtitle,
    fontWeight: '600',
  },
});
