import { useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, TextInput, View } from 'react-native';

import { Body, Card, ScreenContainer, Subtitle, Title } from '@/components/ui';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useAppPalette } from '@/components/ui/use-app-palette';
import { spacing } from '@/constants/design-system';
import { getHistory, initDB } from '../../lib/db';

type HistoryRow = {
  id: number;
  barcode: string;
  action: string;
  quantity_change: number;
  timestamp: string;
  item_name?: string | null;
};

function displayItemName(row: HistoryRow): string {
  const n = row.item_name?.trim();
  if (n) return n;
  return 'Unnamed item';
}

function displayQuantityChange(row: HistoryRow): string {
  const sign = row.quantity_change > 0 ? '+' : '';
  return `${sign}${row.quantity_change}`;
}

function formatWhen(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export default function HistoryScreen() {
  const router = useRouter();
  const colors = useAppPalette();
  const [history, setHistory] = useState<HistoryRow[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    initDB();

    const data = getHistory() as HistoryRow[];
    setHistory(data);
  }, []);

  const filteredHistory = useMemo(() => {
    if (!searchQuery.trim()) return history;
    
    const query = searchQuery.toLowerCase();
    return history.filter(item => 
      item.barcode.toLowerCase().includes(query) ||
      item.action.toLowerCase().includes(query) ||
      item.item_name?.toLowerCase().includes(query) ||
      displayQuantityChange(item).toLowerCase().includes(query)
    );
  }, [history, searchQuery]);

  return (
    <ScreenContainer>
      <View style={styles.page}>
        <View style={styles.header}>
          <Title>Movement history</Title>
          <Subtitle>Chronological log of inventory changes tied to each barcode.</Subtitle>
        </View>

        <View style={styles.searchContainer}>
          <View style={[styles.searchInput, { backgroundColor: colors.surfaceElevated, borderColor: colors.borderSubtle }]}>
            <IconSymbol name="magnifyingglass" size={16} color={colors.textMuted} style={styles.searchIcon} />
            <TextInput
              style={[styles.searchTextInput, { color: colors.textPrimary }]}
              placeholder="Search history..."
              placeholderTextColor={colors.textMuted}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </View>

        <FlatList
          data={filteredHistory}
          keyExtractor={(item) => item.id.toString()}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <Card>
              <Body muted>
                {searchQuery.trim()
                  ? 'No history entries found matching your search.' 
                  : 'No movements recorded yet. Scan items in the Scanner tab to populate this log.'
                }
              </Body>
            </Card>
          }
          renderItem={({ item }) => (
            <Pressable
              onPress={() =>
                router.push({
                  pathname: '/items/edit/[barcode]',
                  params: { barcode: item.barcode },
                })
              }
              style={({ pressed }) => [pressed && { opacity: 0.85 }]}>
              <Card style={styles.rowCard} padded>
                <View style={styles.itemHeader}>
                  <Title style={styles.itemName}>{displayItemName(item)}</Title>
                  <View style={[
                    styles.quantityBadge,
                    item.quantity_change > 0 ? styles.positiveBadge : styles.negativeBadge
                  ]}>
                    <Title style={styles.quantityText}>{displayQuantityChange(item)}</Title>
                  </View>
                </View>
                <Subtitle style={styles.barcode} numberOfLines={2}>
                  {item.barcode}
                </Subtitle>
                {item.action === 'CREATE' && (
                  <Body style={styles.createdNote}>New item created</Body>
                )}
                <Body muted style={styles.when}>{formatWhen(item.timestamp)}</Body>
              </Card>
            </Pressable>
          )}
        />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing['3xl'],
  },
  header: {
    marginBottom: spacing.xl,
    gap: spacing.sm,
  },
  searchContainer: {
    marginBottom: spacing.lg,
  },
  searchInput: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  searchIcon: {
    marginLeft: spacing.xs,
  },
  searchTextInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 2,
  },
  listContent: {
    paddingBottom: spacing['3xl'],
    flexGrow: 1,
  },
  rowCard: {
    marginBottom: spacing.md,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  itemName: {
    fontSize: 17,
    lineHeight: 23,
    flex: 1,
  },
  quantityBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 12,
    minWidth: 50,
    alignItems: 'center',
  },
  positiveBadge: {
    backgroundColor: '#4CAF50',
  },
  negativeBadge: {
    backgroundColor: '#F44336',
  },
  quantityText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
  },
  barcode: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: 'monospace',
    marginBottom: spacing.xs,
  },
  createdNote: {
    fontSize: 12,
    color: '#4CAF50',
    fontStyle: 'italic',
    marginBottom: spacing.xs,
  },
  when: {
    fontSize: 14,
    lineHeight: 20,
  },
});
