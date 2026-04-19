import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, View } from 'react-native';

import { Body, PrimaryButton, ScreenContainer, Title } from '@/components/ui';
import { spacing } from '@/constants/design-system';

export default function ModalScreen() {
  const router = useRouter();

  return (
    <ScreenContainer scrollable>
      <View style={styles.content}>
        <Title>Modal surface</Title>
        <Body muted style={styles.copy}>
          Use modals for focused tasks—bulk edits, confirmations, or quick lookups—without losing tab context.
        </Body>
        <PrimaryButton title="Return to home" onPress={() => router.dismiss()} />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    gap: spacing.lg,
    paddingVertical: spacing['3xl'],
  },
  copy: {
    marginBottom: spacing.sm,
  },
});
