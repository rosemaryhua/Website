import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function OverlapAlert({ overlap, onPress }) {
  const familyCount = overlap.families.length;

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => onPress?.(overlap)}
      activeOpacity={0.7}
    >
      <View style={styles.iconContainer}>
        <Ionicons name="people-circle" size={28} color="#F5A623" />
      </View>
      <View style={styles.content}>
        <Text style={styles.title}>
          {familyCount} families overlapping!
        </Text>
        <Text style={styles.detail}>
          {overlap.familyNames.join(' & ')}
        </Text>
        <Text style={styles.location}>
          {overlap.location} on {overlap.date}
        </Text>
      </View>
      <View style={styles.dots}>
        {overlap.familyColors.map((color, i) => (
          <View key={i} style={[styles.dot, { backgroundColor: color }]} />
        ))}
      </View>
    </TouchableOpacity>
  );
}

export function OverlapBanner({ overlaps }) {
  if (!overlaps || overlaps.length === 0) return null;

  return (
    <View style={styles.banner}>
      <Ionicons name="sparkles" size={18} color="#F5A623" />
      <Text style={styles.bannerText}>
        {overlaps.length} meetup {overlaps.length === 1 ? 'opportunity' : 'opportunities'} found!
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#FFF8E7',
    borderRadius: 12,
    marginHorizontal: 16,
    marginVertical: 6,
    padding: 14,
    borderWidth: 1,
    borderColor: '#F5D88E',
    alignItems: 'center',
  },
  iconContainer: {
    marginRight: 12,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    color: '#8B6914',
  },
  detail: {
    fontSize: 13,
    color: '#A07D1A',
    marginTop: 2,
  },
  location: {
    fontSize: 12,
    color: '#B8941F',
    marginTop: 2,
  },
  dots: {
    flexDirection: 'row',
    gap: 4,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#fff',
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF8E7',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F5D88E',
  },
  bannerText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8B6914',
  },
});
