import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { useTrip } from '../context/TripContext';
import { FAMILIES } from '../constants/families';
import EventItem from '../components/EventItem';
import OverlapAlert from '../components/OverlapAlert';

export default function CalendarScreen() {
  const { itineraries, overlaps } = useTrip();
  const [selectedDate, setSelectedDate] = useState(null);

  // Build marked dates for the calendar
  const markedDates = useMemo(() => {
    const marks = {};

    for (const family of FAMILIES) {
      const events = itineraries[family.id] || [];
      for (const event of events) {
        if (!event.date) continue;
        if (!marks[event.date]) {
          marks[event.date] = { dots: [], marked: true };
        }
        // Add a dot for this family if not already present
        const hasDot = marks[event.date].dots.some((d) => d.key === family.id);
        if (!hasDot) {
          marks[event.date].dots.push({
            key: family.id,
            color: family.color,
          });
        }
      }
    }

    // Highlight selected date
    if (selectedDate && marks[selectedDate]) {
      marks[selectedDate] = { ...marks[selectedDate], selected: true, selectedColor: '#4A90D9' };
    } else if (selectedDate) {
      marks[selectedDate] = { selected: true, selectedColor: '#4A90D9', dots: [] };
    }

    return marks;
  }, [itineraries, selectedDate]);

  // Events for selected date
  const dayEvents = useMemo(() => {
    if (!selectedDate) return [];
    const events = [];
    for (const family of FAMILIES) {
      const familyEvents = itineraries[family.id] || [];
      for (const event of familyEvents) {
        if (event.date === selectedDate) {
          events.push({ ...event, familyId: family.id });
        }
      }
    }
    return events.sort((a, b) => (a.time || '').localeCompare(b.time || ''));
  }, [selectedDate, itineraries]);

  const dayOverlaps = useMemo(() => {
    if (!selectedDate) return [];
    return overlaps.filter((o) => o.date === selectedDate);
  }, [selectedDate, overlaps]);

  return (
    <View style={styles.container}>
      <Calendar
        markingType="multi-dot"
        markedDates={markedDates}
        onDayPress={(day) => setSelectedDate(day.dateString)}
        theme={{
          todayTextColor: '#4A90D9',
          selectedDayBackgroundColor: '#4A90D9',
          dotStyle: { width: 6, height: 6, borderRadius: 3, marginTop: 2 },
          arrowColor: '#4A90D9',
          textDayFontWeight: '500',
          textMonthFontWeight: '700',
        }}
      />

      {selectedDate && (
        <View style={styles.dayDetail}>
          <Text style={styles.dayTitle}>{formatDate(selectedDate)}</Text>

          {/* Family legend */}
          <View style={styles.legend}>
            {FAMILIES.map((f) => (
              <View key={f.id} style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: f.color }]} />
                <Text style={styles.legendText}>{f.name}</Text>
              </View>
            ))}
          </View>

          {dayOverlaps.map((overlap) => (
            <OverlapAlert key={overlap.id} overlap={overlap} />
          ))}

          <FlatList
            data={dayEvents}
            keyExtractor={(item, i) => `${item.familyId}-${item.id || i}`}
            renderItem={({ item }) => (
              <EventItem event={item} familyId={item.familyId} showFamily />
            )}
            ListEmptyComponent={
              <Text style={styles.emptyText}>No events on this day</Text>
            }
          />
        </View>
      )}

      {!selectedDate && (
        <View style={styles.prompt}>
          <Text style={styles.promptText}>Tap a date to see events</Text>
          <Text style={styles.promptSubtext}>
            Dots show which families have events on each day
          </Text>
        </View>
      )}
    </View>
  );
}

function formatDate(dateStr) {
  try {
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  dayDetail: { flex: 1, paddingTop: 8 },
  dayTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    marginBottom: 8,
    gap: 12,
  },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { fontSize: 11, color: '#888' },
  emptyText: {
    textAlign: 'center',
    color: '#bbb',
    fontSize: 14,
    marginTop: 20,
  },
  prompt: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingBottom: 60 },
  promptText: { fontSize: 16, color: '#aaa', fontWeight: '600' },
  promptSubtext: { fontSize: 13, color: '#ccc', marginTop: 4 },
});
