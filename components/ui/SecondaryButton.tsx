import React from 'react';
import { Pressable, StyleSheet, Text, type PressableProps } from 'react-native';

import { radii, spacing, typography } from '@/constants/design-system';

import { useAppPalette } from './use-app-palette';

export type SecondaryButtonProps = PressableProps & {
  title: string;
};

export function SecondaryButton({ title, disabled, style, ...rest }: SecondaryButtonProps) {
  const colors = useAppPalette();

  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      style={(state) => {
        const extra = typeof style === 'function' ? style(state) : style;
        return [
          styles.base,
          {
            backgroundColor: colors.surfaceElevated,
            borderColor: colors.borderSubtle,
            opacity: disabled ? 0.45 : state.pressed ? 0.88 : 1,
          },
          extra,
        ];
      }}
      {...rest}>
      <Text style={[styles.label, { color: colors.textPrimary }]}>{title}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 48,
    paddingHorizontal: spacing.xl,
    borderRadius: radii.md,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    ...typography.subtitle,
    fontWeight: '600',
  },
});
