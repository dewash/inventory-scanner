import React from 'react';
import { ScrollView, StyleSheet, View, type ScrollViewProps, type ViewProps } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { spacing } from '@/constants/design-system';

import { useAppPalette } from './use-app-palette';

export type ScreenContainerProps = ViewProps & {
  scrollable?: boolean;
  scrollViewProps?: Omit<ScrollViewProps, 'children' | 'style' | 'contentContainerStyle'>;
  /** Extra bottom padding inside scroll content (tab bar / home indicator). */
  contentBottomInset?: number;
};

export function ScreenContainer({
  children,
  style,
  scrollable = false,
  scrollViewProps,
  contentBottomInset = spacing['3xl'],
  ...rest
}: ScreenContainerProps) {
  const colors = useAppPalette();

  if (scrollable) {
    return (
      <SafeAreaView
        style={[styles.safe, { backgroundColor: colors.canvas }, style]}
        edges={['top', 'left', 'right']}
        {...rest}>
        <ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: contentBottomInset, backgroundColor: colors.canvas },
          ]}
          {...scrollViewProps}>
          {children}
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[styles.safe, { backgroundColor: colors.canvas }, style]}
      edges={['top', 'left', 'right']}
      {...rest}>
      <View style={[styles.fill, { backgroundColor: colors.canvas }]}>{children}</View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  fill: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
  },
});
