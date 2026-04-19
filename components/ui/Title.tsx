import React from 'react';
import { StyleSheet, Text, type TextProps } from 'react-native';

import { typography } from '@/constants/design-system';

import { useAppPalette } from './use-app-palette';

export type TitleProps = TextProps;

export function Title({ style, children, ...rest }: TitleProps) {
  const colors = useAppPalette();

  return (
    <Text style={[styles.title, { color: colors.textPrimary }, style]} {...rest}>
      {children}
    </Text>
  );
}

const styles = StyleSheet.create({
  title: {
    ...typography.title,
  },
});
