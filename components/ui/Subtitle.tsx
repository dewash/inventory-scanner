import React from 'react';
import { StyleSheet, Text, type TextProps } from 'react-native';

import { typography } from '@/constants/design-system';

import { useAppPalette } from './use-app-palette';

export type SubtitleProps = TextProps;

export function Subtitle({ style, children, ...rest }: SubtitleProps) {
  const colors = useAppPalette();

  return (
    <Text style={[styles.subtitle, { color: colors.textSecondary }, style]} {...rest}>
      {children}
    </Text>
  );
}

const styles = StyleSheet.create({
  subtitle: {
    ...typography.subtitle,
    fontWeight: '400',
  },
});
