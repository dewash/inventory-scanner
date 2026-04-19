import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { Body, useAppPalette } from '@/components/ui';
import { spacing } from '@/constants/design-system';
import { getUniqueCategories } from '@/lib/db';

interface CategoryDropdownProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  required?: boolean;
}

export function CategoryDropdown({ value, onChangeText, placeholder = 'e.g. Peripherals · IT hardware', required = false }: CategoryDropdownProps) {
  const colors = useAppPalette();
  const [categories, setCategories] = useState<string[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [filteredCategories, setFilteredCategories] = useState<string[]>([]);

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    if (showDropdown) {
      const filtered = categories.filter(cat => 
        cat.toLowerCase().includes(value.toLowerCase()) && cat !== value
      );
      setFilteredCategories(filtered);
    }
  }, [value, showDropdown, categories]);

  const loadCategories = () => {
    try {
      const cats = getUniqueCategories();
      setCategories(cats);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const handleFocus = () => {
    setShowDropdown(true);
  };

  const handleBlur = () => {
    // Delay hiding dropdown to allow for item selection
    setTimeout(() => setShowDropdown(false), 200);
  };

  const handleSelectCategory = (category: string) => {
    onChangeText(category);
    setShowDropdown(false);
  };

  const isNewCategory = value.trim() !== '' && !categories.some(cat => cat.toLowerCase() === value.trim().toLowerCase());

  const handleCreateNewCategory = () => {
    if (isNewCategory) {
      onChangeText(value.trim());
      setShowDropdown(false);
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={[
          styles.input,
          {
            color: colors.textPrimary,
            backgroundColor: colors.surface,
            borderColor: required && !value.trim() ? colors.accent : colors.borderSubtle,
          },
        ]}
        placeholder={required ? `${placeholder} *` : placeholder}
        placeholderTextColor={colors.textMuted}
        value={value}
        onChangeText={onChangeText}
        onFocus={handleFocus}
        onBlur={handleBlur}
        autoCapitalize="sentences"
      />
      
      {showDropdown && (filteredCategories.length > 0 || isNewCategory) && (
        <View style={[styles.dropdownUp, { backgroundColor: colors.surfaceElevated, borderColor: colors.borderSubtle }]}>
          {filteredCategories.map((category) => (
            <Pressable
              key={category}
              style={({ pressed }) => [
                styles.dropdownItem,
                { backgroundColor: pressed ? colors.borderSubtle : 'transparent' },
              ]}
              onPress={() => handleSelectCategory(category)}
            >
              <Text style={[styles.dropdownText, { color: colors.textPrimary }]}>{category}</Text>
            </Pressable>
          ))}
          
          {isNewCategory && (
            <Pressable
              style={[styles.dropdownItem, styles.newCategory]}
              onPress={handleCreateNewCategory}
            >
              <Text style={[styles.dropdownText, { color: colors.accent }]}>
                Create "{value.trim()}"
              </Text>
              <Body muted style={styles.newCategoryText}>New category</Body>
            </Pressable>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  input: {
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: 16,
  },
  dropdown: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    marginTop: spacing.xs,
    maxHeight: 200,
    zIndex: 1000,
  },
  dropdownUp: {
    position: 'absolute',
    bottom: '100%',
    left: 0,
    right: 0,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    marginBottom: spacing.xs,
    maxHeight: 200,
    zIndex: 1000,
  },
  dropdownItem: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  dropdownText: {
    fontSize: 16,
  },
  newCategory: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#e5e5e5',
  },
  newCategoryText: {
    fontSize: 12,
    marginTop: 2,
  },
});
