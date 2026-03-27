import React, { useMemo } from 'react';
import {
  View,
  Text,
  SectionList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTrip } from '../context/TripContext';
import { FAMILIES } from '../constants/families';
import { FamilyFilterBar } from '../components/FamilyBadge';
import EventItem from '../components/EventItem';
import { OverlapBanner } from '../components/OverlapAlert';
import OverlapAlert from '../components/OverlapAlert';

export default function ItineraryScreen({ navigation }) {
  const { itineraries, overlaps, selectedFamily, selectFamily, loading } = useTrip();

  const sections = useMemo(() => {
    // Collect all events, optionally filtered by family
    const allEvents = [];
    const familyIds = selectedFamily ? [selectedFamily] : FAMILIES.map((f) => f.id);

    for (const familyId of familyIds) {
      const events = itineraries[familyId] || [];
      for (const event of events) {
        allEvents.push({ ...event, familyId });
      }
    }

    // Group by date
    const byDate = {};
    for (const event of allEvents) {
      const date = event.date || 'No Date';
      if (!byDate[date]) byDate[date] = [];
      byDate[date].push(event);
    }

    // Sort events within each date by time
    return Object.entries(byDate)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, data]) => ({
        title: date,
        data: data.sort((a, b) => (a.time || '').localeCompare(b.time || '')),
        overlaps: overlaps.filter((o) => o.date === date),
      }));
  }, [itineraries, selectedFamily, overlaps]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#4A90D9" />
        <Text style={styles.loadingText}>Loading itineraries...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FamilyFilterBar selectedFamily={selectedFamily} onSelect={selectFamily} />
      <OverlapBanner overlaps={overlaps} />

      <SectionList
        sections={sections}
        keyExtractor={(item, index) => `${item.familyId}-${item.id || index}`}
        renderSectionHeader={({ section }) => (
          <View>
            <View style={styles.dateHeader}>
              <Text style={styles.dateText}>{formatDate(section.title)}</Text>
              {section.overlaps.length > 0 && (
                <View style={styles.overlapBadge}>
                  <Ionicons name="people" size={12} color="#F5A623" />
                  <Text style={styles.overlapCount}>{section.overlaps.length}</Text>
                </View>
              )}
            </View>
            {section.overlaps.map((overlap) => (
              <OverlapAlert key={overlap.id} overlap={overlap} />
            ))}
          </View>
        )}
        renderItem={({ item }) => (
          <EventItem event={item} familyId={item.familyId} showFamily={!selectedFamily} />
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="calendar-outline" size={48} color="#ccc" />
            <Text style={styles.emptyText}>No itinerary events yet</Text>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => navigation.navigate('ManualEntry')}
            >
              <Text style={styles.addButtonText}>Add Events</Text>
            </TouchableOpacity>
          </View>
        }
        contentContainerStyle={sections.length === 0 ? styles.emptyList : undefined}
        stickySectionHeadersEnabled={false}
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('ManualEntry')}
      >
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

function formatDate(dateStr) {
  if (!dateStr || dateStr === 'No Date') return dateStr;
  try {
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 12, color: '#888', fontSize: 14 },
  dateHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  dateText: { fontSize: 16, fontWeight: '700', color: '#333' },
  overlapBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
    backgroundColor: '#FFF8E7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    gap: 3,
  },
  overlapCount: { fontSize: 11, fontWeight: '700', color: '#F5A623' },
  empty: { alignItems: 'center', paddingTop: 80 },
  emptyText: { marginTop: 12, color: '#aaa', fontSize: 16 },
  emptyList: { flexGrow: 1 },
  addButton: {
    marginTop: 16,
    backgroundColor: '#4A90D9',
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 20,
  },
  addButtonText: { color: '#fff', fontWeight: '600', fontSize: 15 },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#4A90D9',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
  },
});
