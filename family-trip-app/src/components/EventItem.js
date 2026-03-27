import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { FAMILIES } from '../constants/families';

export default function EventItem({ event, familyId, showFamily = true }) {
  const family = FAMILIES.find((f) => f.id === familyId);
  const color = family?.color || '#999';

  return (
    <View style={[styles.container, { borderLeftColor: color }]}>
      <View style={styles.timeContainer}>
        <Text style={styles.time}>{event.time || '--:--'}</Text>
      </View>
      <View style={styles.content}>
        <Text style={styles.activity}>{event.activity}</Text>
        {event.location ? (
          <Text style={styles.location}>{event.location}</Text>
        ) : null}
        {showFamily && family ? (
          <View style={[styles.familyTag, { backgroundColor: color + '20' }]}>
            <Text style={[styles.familyTagText, { color }]}>
              {family.emoji} {family.name}
            </Text>
          </View>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 10,
    marginHorizontal: 16,
    marginVertical: 4,
    padding: 12,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  timeContainer: {
    width: 55,
    marginRight: 12,
    justifyContent: 'center',
  },
  time: {
    fontSize: 14,
    fontWeight: '600',
    color: '#555',
  },
  content: {
    flex: 1,
  },
  activity: {
    fontSize: 15,
    fontWeight: '600',
    color: '#222',
    marginBottom: 2,
  },
  location: {
    fontSize: 13,
    color: '#888',
    marginBottom: 4,
  },
  familyTag: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    marginTop: 4,
  },
  familyTagText: {
    fontSize: 11,
    fontWeight: '600',
  },
});
