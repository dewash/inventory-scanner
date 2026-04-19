import React from 'react';
import { StyleSheet, Text, type TextProps } from 'react-native';

import { typography } from '@/constants/design-system';

import { useAppPalette } from './use-app-palette';

export type BodyProps = TextProps & {
  muted?: boolean;
};

export function Body({ style, muted, children, ...rest }: BodyProps) {
  const colors = useAppPalette();
  const color = muted ? colors.textMuted : colors.textPrimary;

  return (
    <Text style={[styles.body, { color }, style]} {...rest}>
      {children}
    </Text>
  );
}

const styles = StyleSheet.create({
  body: {
    ...typography.body,
  },
});
