import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { Body, Card, Input, PrimaryButton, ScreenContainer, Subtitle, Title, useAppPalette } from '@/components/ui';
import { CategoryDropdown } from '@/components/ui/category-dropdown';
import { radii, spacing } from '@/constants/design-system';
import { getItem, initDB, updateItemDetails, updateQuantity } from '@/lib/db';

function paramBarcode(raw: string | string[] | undefined) {
  const v = Array.isArray(raw) ? raw[0] : raw;
  return v ?? '';
}

type ItemRow = {
  name: string | null;
  /** SQLite may return integers as numbers or strings depending on platform. */
  quantity: number | string | null;
  location?: string | null;
  category?: string | null;
};

function readQuantity(row: ItemRow | null): number {
  if (!row || row.quantity === null || row.quantity === undefined) return 0;
  const n = Number(row.quantity);
  if (Number.isNaN(n)) return 0;
  return Math.max(0, Math.floor(n));
}

export default function EditItemScreen() {
  const router = useRouter();
  const colors = useAppPalette();
  const { barcode: barcodeParam } = useLocalSearchParams<{ barcode: string }>();
  const barcode = useMemo(() => paramBarcode(barcodeParam), [barcodeParam]);

  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [category, setCategory] = useState('');
  const [dbQty, setDbQty] = useState(0);
  const [qtyInput, setQtyInput] = useState('0');
  /** Latest digits-only draft; always in sync before blur/submit so commits are never stale. */
  const qtyDraftRef = useRef('0');

  const setQtyFromDb = useCallback((q: number) => {
    const s = String(q);
    setDbQty(q);
    setQtyInput(s);
    qtyDraftRef.current = s;
  }, []);

  const syncQtyFromDb = useCallback(() => {
    if (!barcode) return;
    const row = getItem(barcode) as ItemRow | null;
    if (!row) return;
    setQtyFromDb(readQuantity(row));
  }, [barcode, setQtyFromDb]);

  useEffect(() => {
    initDB();
    if (!barcode) return;

    const row = getItem(barcode) as ItemRow | null;

    if (!row) {
      Alert.alert('Item not found', 'This barcode is not in your inventory.', [
        { text: 'OK', onPress: () => router.back() },
      ]);
      return;
    }

    setName(row.name ?? '');
    setLocation(row.location ?? '');
    setCategory(row.category ?? '');
    setQtyFromDb(readQuantity(row));
  }, [barcode, router, setQtyFromDb]);

  const increment = useCallback(() => {
    if (!barcode) return;
    updateQuantity(barcode, 1);
    syncQtyFromDb();
  }, [barcode, syncQtyFromDb]);

  const decrement = useCallback(() => {
    if (!barcode) return;
    const row = getItem(barcode) as ItemRow | null;
    const q = readQuantity(row);
    if (q <= 0) return;
    updateQuantity(barcode, -1);
    syncQtyFromDb();
  }, [barcode, syncQtyFromDb]);

  /** Always read current stock from SQLite and commit using `text` from the field (avoids stale React state). */
  const commitQuantityText = useCallback(
    (raw: string) => {
      if (!barcode) return;

      const row = getItem(barcode) as ItemRow | null;
      if (!row) return;

      const currentDb = readQuantity(row);
      const digitsOnly = raw.replace(/\D/g, '').trim();

      if (digitsOnly === '') {
        setQtyFromDb(currentDb);
        return;
      }

      const parsed = Number.parseInt(digitsOnly, 10);
      if (Number.isNaN(parsed) || parsed < 0) {
        setQtyFromDb(currentDb);
        return;
      }

      const delta = parsed - currentDb;
      if (delta !== 0) {
        updateQuantity(barcode, delta);
      }

      const after = getItem(barcode) as ItemRow | null;
      setQtyFromDb(readQuantity(after));
    },
    [barcode, setQtyFromDb]
  );

  const handleSave = () => {
    if (!barcode) return;

    // Validate required item name field
    if (!name.trim()) {
      Alert.alert('Item Name Required', 'Please enter a name for this item.');
      return;
    }

    // Validate required category field
    if (!category.trim()) {
      Alert.alert('Category Required', 'Please select or enter a category for this item.');
      return;
    }

    commitQuantityText(qtyDraftRef.current);

    updateItemDetails(barcode, {
      name: name.trim(),
      location: location.trim(),
      category: category.trim(),
    });

    router.back();
  };

  if (!barcode) {
    return (
      <ScreenContainer scrollable>
        <Body muted>Missing barcode.</Body>
      </ScreenContainer>
    );
  }

  return (
    <KeyboardAvoidingView 
      style={{ flex: 1 }} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <ScreenContainer scrollable contentBottomInset={spacing['2xl']}>
        <View style={styles.header}>
          <Title>Edit item</Title>
          <Subtitle>Adjust stock with +/− or type a quantity, then edit details below.</Subtitle>
        </View>

        <Card style={styles.card}>
          <Subtitle style={styles.label}>Stock quantity</Subtitle>
          <View style={styles.qtyRow}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Increase quantity"
              onPress={increment}
              style={({ pressed }) => [
                styles.qtySideBtn,
                {
                  backgroundColor: colors.accentMuted,
                  borderColor: colors.borderSubtle,
                  opacity: pressed ? 0.88 : 1,
                },
              ]}>
              <Text style={[styles.qtySideBtnText, { color: colors.accent }]}>+</Text>
            </Pressable>

            <TextInput
              value={qtyInput}
              onChangeText={(t) => {
                const v = t.replace(/\D/g, '');
                qtyDraftRef.current = v;
                setQtyInput(v);
              }}
              onBlur={() => commitQuantityText(qtyDraftRef.current)}
              onEndEditing={(e) => commitQuantityText(e.nativeEvent.text.replace(/\D/g, ''))}
              onSubmitEditing={() => commitQuantityText(qtyDraftRef.current)}
              keyboardType="number-pad"
              returnKeyType="done"
              selectTextOnFocus
              placeholder="0"
              placeholderTextColor={colors.textMuted}
              style={[
                styles.qtyField,
                {
                  color: colors.textPrimary,
                  backgroundColor: colors.surface,
                  borderColor: colors.borderSubtle,
                },
              ]}
            />

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Decrease quantity"
              onPress={decrement}
              disabled={dbQty <= 0}
              style={({ pressed }) => [
                styles.qtySideBtn,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.borderSubtle,
                  opacity: dbQty <= 0 ? 0.35 : pressed ? 0.85 : 1,
                },
              ]}>
              <Text style={[styles.qtySideBtnText, { color: colors.textPrimary }]}>−</Text>
            </Pressable>
          </View>
          <Body muted style={styles.qtyHint}>Tap outside the number or press done to apply a typed quantity.</Body>
        </Card>

        <Card style={styles.card}>
          <Subtitle style={styles.label}>Barcode</Subtitle>
          <Body style={styles.mono}>{barcode}</Body>
        </Card>

        <Card style={styles.card}>
          <Subtitle style={styles.label}>Item name *</Subtitle>
          <Input placeholder="e.g. Dell laptop dock" value={name} onChangeText={setName} autoCapitalize="words" />
        </Card>

        <Card style={styles.card}>
          <Subtitle style={styles.label}>Location</Subtitle>
          <Input
            placeholder="e.g. Rack A3 · Bin 12"
            value={location}
            onChangeText={setLocation}
            autoCapitalize="sentences"
          />
        </Card>

        <Card style={styles.card}>
          <Subtitle style={styles.label}>Category *</Subtitle>
          <CategoryDropdown value={category} onChangeText={setCategory} required />
        </Card>

        <PrimaryButton title="Save changes" onPress={handleSave} style={styles.save} />
      </ScreenContainer>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  header: {
    marginBottom: spacing.xl,
    gap: spacing.sm,
  },
  card: {
    marginBottom: spacing.lg,
  },
  label: {
    marginBottom: spacing.sm,
    fontSize: 12,
    lineHeight: 16,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    fontWeight: '600',
  },
  mono: {
    fontFamily: 'monospace',
  },
  save: {
    alignSelf: 'stretch',
  },
  qtyRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: spacing.md,
  },
  qtySideBtn: {
    width: 80,
    minHeight: 88,
    borderRadius: radii.lg,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtySideBtnText: {
    fontSize: 40,
    lineHeight: 44,
    fontWeight: '300',
    marginTop: -4,
  },
  qtyField: {
    flex: 1,
    minHeight: 88,
    borderRadius: radii.lg,
    borderWidth: StyleSheet.hairlineWidth,
    fontSize: 32,
    fontWeight: '600',
    textAlign: 'center',
    paddingHorizontal: spacing.sm,
  },
  qtyHint: {
    marginTop: spacing.md,
    fontSize: 13,
  },
});
