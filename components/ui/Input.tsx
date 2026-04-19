import React, { forwardRef } from 'react';
import { StyleSheet, TextInput, type TextInputProps } from 'react-native';

import { radii, spacing, typography } from '@/constants/design-system';

import { useAppPalette } from './use-app-palette';

export type InputProps = TextInputProps & {
  /** Shown when the field is used inside a labeled group (optional). */
  invalid?: boolean;
};

export const Input = forwardRef<TextInput, InputProps>(function Input(
  { style, placeholderTextColor, invalid, ...rest },
  ref
) {
  const colors = useAppPalette();

  return (
    <TextInput
      ref={ref}
      placeholderTextColor={placeholderTextColor ?? colors.textMuted}
      cursorColor={colors.accent}
      selectionColor={colors.accentMuted}
      style={[
        styles.input,
        {
          color: colors.textPrimary,
          backgroundColor: colors.surface,
          borderColor: invalid ? colors.danger : colors.borderSubtle,
        },
        style,
      ]}
      {...rest}
    />
  );
});

const styles = StyleSheet.create({
  input: {
    ...typography.body,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: radii.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    minHeight: 48,
  },
});
