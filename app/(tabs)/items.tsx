import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, TextInput, View } from 'react-native';

import { Body, Card, ScreenContainer, Subtitle, Title } from '@/components/ui';
import { CategoryDropdown } from '@/components/ui/category-dropdown';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useAppPalette } from '@/components/ui/use-app-palette';
import { spacing } from '@/constants/design-system';
import { getAllItems, initDB } from '@/lib/db';

type ItemRow = {
  id: number;
  barcode: string;
  name: string | null;
  quantity: number;
  location?: string | null;
  category?: string | null;
};

export default function ItemsTabScreen() {
  const router = useRouter();
  const colors = useAppPalette();
  const [items, setItems] = useState<ItemRow[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  const load = useCallback(() => {
    initDB();
    setItems(getAllItems() as ItemRow[]);
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const filteredItems = useMemo(() => {
    let filtered = items;
    
    // Filter by category first
    if (selectedCategory.trim()) {
      filtered = filtered.filter(item => item.category === selectedCategory);
    }
    
    // Then filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(item => 
        item.name?.toLowerCase().includes(query) ||
        item.barcode.toLowerCase().includes(query) ||
        item.location?.toLowerCase().includes(query) ||
        item.category?.toLowerCase().includes(query)
      );
    }
    
    return filtered;
  }, [items, searchQuery, selectedCategory]);

  return (
    <ScreenContainer>
      <View style={styles.page}>
        <View style={styles.header}>
          <Title style={styles.headerTitle}>Items</Title>
        </View>
        
        <View style={styles.searchContainer}>
          <View style={[styles.searchInput, { backgroundColor: colors.surfaceElevated, borderColor: colors.borderSubtle }]}>
            <IconSymbol name="magnifyingglass" size={16} color={colors.textMuted} style={styles.searchIcon} />
            <TextInput
              style={[styles.searchTextInput, { color: colors.textPrimary }]}
              placeholder="Search items..."
              placeholderTextColor={colors.textMuted}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </View>
        
        <View style={styles.filterContainer}>
          <View style={styles.filterLabel}>
            <IconSymbol name="line.3.horizontal.decrease.circle" size={16} color={colors.textMuted} />
            <Subtitle style={styles.filterText}>Filter by category</Subtitle>
          </View>
          <CategoryDropdown
            value={selectedCategory}
            onChangeText={setSelectedCategory}
            placeholder="All categories"
          />
        </View>
        <FlatList
          data={filteredItems}
          keyExtractor={(row) => String(row.id)}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          ItemSeparatorComponent={() => <View style={{ height: spacing.md }} />}
          ListEmptyComponent={
            <Card>
              <Body muted>
                {searchQuery.trim() || selectedCategory.trim()
                  ? 'No items found matching your filters.' 
                  : 'No items recorded yet. Use Scan item on the home tab to add your first barcode.'
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
              <Card style={styles.rowCard}>
                <View style={styles.rowTop}>
                  <View style={[styles.iconWrap, { backgroundColor: colors.accentMuted }]}>
                    <IconSymbol name="shippingbox.fill" size={22} color={colors.accent} />
                  </View>
                  <View style={styles.rowText}>
                    <Title style={styles.itemTitle}>{item.name?.trim() || 'Unnamed item'}</Title>
                    <Subtitle style={styles.barcode} numberOfLines={1}>
                      {item.barcode}
                    </Subtitle>
                  </View>
                  <Body style={styles.qty}>×{item.quantity}</Body>
                </View>
                {(item.location || item.category) && (
                  <Subtitle style={styles.meta} numberOfLines={2}>
                    {[item.category, item.location].filter(Boolean).join(' · ')}
                  </Subtitle>
                )}
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
    paddingTop: spacing.md,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.lg,
    paddingTop: spacing.sm,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '600',
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
  filterContainer: {
    marginBottom: spacing.lg,
  },
  filterLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  filterText: {
    fontSize: 14,
    lineHeight: 18,
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
    marginBottom: 0,
  },
  rowTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowText: {
    flex: 1,
    minWidth: 0,
  },
  itemTitle: {
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 2,
  },
  barcode: {
    fontSize: 12,
    lineHeight: 16,
    fontFamily: 'monospace',
  },
  qty: {
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
  meta: {
    marginTop: spacing.sm,
    fontSize: 13,
  },
});
