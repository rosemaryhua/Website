import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { FAMILIES } from '../constants/families';

export default function FamilyBadge({ familyId, selected, onPress, size = 'medium' }) {
  const family = FAMILIES.find((f) => f.id === familyId);
  if (!family) return null;

  const isSmall = size === 'small';

  return (
    <TouchableOpacity
      onPress={() => onPress?.(familyId)}
      style={[
        styles.badge,
        { backgroundColor: family.color },
        selected && styles.selected,
        isSmall && styles.badgeSmall,
      ]}
      activeOpacity={0.7}
    >
      <Text style={[styles.emoji, isSmall && styles.emojiSmall]}>{family.emoji}</Text>
      <Text style={[styles.name, isSmall && styles.nameSmall]}>{family.name}</Text>
    </TouchableOpacity>
  );
}

export function FamilyFilterBar({ selectedFamily, onSelect }) {
  return (
    <View style={styles.filterBar}>
      <TouchableOpacity
        onPress={() => onSelect(null)}
        style={[styles.filterChip, !selectedFamily && styles.filterChipActive]}
      >
        <Text style={[styles.filterText, !selectedFamily && styles.filterTextActive]}>All</Text>
      </TouchableOpacity>
      {FAMILIES.map((family) => (
        <TouchableOpacity
          key={family.id}
          onPress={() => onSelect(family.id)}
          style={[
            styles.filterChip,
            selectedFamily === family.id && { backgroundColor: family.color },
          ]}
        >
          <Text
            style={[
              styles.filterText,
              selectedFamily === family.id && styles.filterTextActive,
            ]}
          >
            {family.emoji} {family.name}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 4,
  },
  badgeSmall: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  selected: {
    borderWidth: 2,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
  emoji: { fontSize: 16, marginRight: 4 },
  emojiSmall: { fontSize: 12, marginRight: 2 },
  name: { color: '#fff', fontWeight: '600', fontSize: 14 },
  nameSmall: { fontSize: 11 },
  filterBar: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#fff',
    flexWrap: 'wrap',
    gap: 6,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
  },
  filterChipActive: {
    backgroundColor: '#333',
  },
  filterText: {
    fontSize: 13,
    color: '#666',
    fontWeight: '500',
  },
  filterTextActive: {
    color: '#fff',
  },
});
