import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { FAMILIES } from '../constants/families';
import { addItineraryEvent, saveItineraryEvents } from '../services/firebase';

export default function ManualEntryScreen({ navigation }) {
  const [selectedFamily, setSelectedFamily] = useState(null);
  const [mode, setMode] = useState('single'); // 'single' or 'bulk'

  // Single event fields
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [activity, setActivity] = useState('');
  const [location, setLocation] = useState('');

  // Bulk paste
  const [bulkText, setBulkText] = useState('');

  async function handleAddSingle() {
    if (!selectedFamily) {
      Alert.alert('Select a family', 'Please choose which family this event belongs to.');
      return;
    }
    if (!date || !activity) {
      Alert.alert('Missing fields', 'Date and activity are required.');
      return;
    }

    try {
      await addItineraryEvent(selectedFamily, {
        date,
        time,
        activity,
        location,
        latitude: null,
        longitude: null,
      });
      Alert.alert('Added!', 'Event added to itinerary.');
      setDate('');
      setTime('');
      setActivity('');
      setLocation('');
    } catch (err) {
      Alert.alert('Error', err.message);
    }
  }

  async function handleBulkPaste() {
    if (!selectedFamily) {
      Alert.alert('Select a family', 'Please choose which family these events belong to.');
      return;
    }
    if (!bulkText.trim()) {
      Alert.alert('Empty', 'Please paste your itinerary text.');
      return;
    }

    try {
      const events = parseBulkText(bulkText);
      if (events.length === 0) {
        Alert.alert('No events found', 'Could not parse any events from the text. Try the format:\nDate | Time | Activity | Location\n\nExample:\n2024-03-15 | 9:00 AM | Visit museum | Downtown');
        return;
      }

      await saveItineraryEvents(selectedFamily, events);
      Alert.alert('Success!', `${events.length} events added to itinerary.`);
      setBulkText('');
    } catch (err) {
      Alert.alert('Error', err.message);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.heading}>Add Itinerary Events</Text>
        <Text style={styles.subheading}>
          Paste from Apple Notes or add events manually
        </Text>

        {/* Family Selector */}
        <Text style={styles.label}>Select Family</Text>
        <View style={styles.familyRow}>
          {FAMILIES.map((family) => (
            <TouchableOpacity
              key={family.id}
              style={[
                styles.familyChip,
                selectedFamily === family.id && { backgroundColor: family.color },
              ]}
              onPress={() => setSelectedFamily(family.id)}
            >
              <Text
                style={[
                  styles.familyChipText,
                  selectedFamily === family.id && { color: '#fff' },
                ]}
              >
                {family.emoji} {family.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Mode Toggle */}
        <View style={styles.modeToggle}>
          <TouchableOpacity
            style={[styles.modeButton, mode === 'single' && styles.modeActive]}
            onPress={() => setMode('single')}
          >
            <Ionicons
              name="add-circle-outline"
              size={18}
              color={mode === 'single' ? '#fff' : '#666'}
            />
            <Text style={[styles.modeText, mode === 'single' && styles.modeTextActive]}>
              Single Event
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.modeButton, mode === 'bulk' && styles.modeActive]}
            onPress={() => setMode('bulk')}
          >
            <Ionicons
              name="clipboard-outline"
              size={18}
              color={mode === 'bulk' ? '#fff' : '#666'}
            />
            <Text style={[styles.modeText, mode === 'bulk' && styles.modeTextActive]}>
              Bulk Paste
            </Text>
          </TouchableOpacity>
        </View>

        {mode === 'single' ? (
          <View>
            <Text style={styles.label}>Date (YYYY-MM-DD)</Text>
            <TextInput
              style={styles.input}
              value={date}
              onChangeText={setDate}
              placeholder="2024-03-15"
              placeholderTextColor="#bbb"
            />
            <Text style={styles.label}>Time</Text>
            <TextInput
              style={styles.input}
              value={time}
              onChangeText={setTime}
              placeholder="9:00 AM"
              placeholderTextColor="#bbb"
            />
            <Text style={styles.label}>Activity</Text>
            <TextInput
              style={styles.input}
              value={activity}
              onChangeText={setActivity}
              placeholder="Visit the museum"
              placeholderTextColor="#bbb"
            />
            <Text style={styles.label}>Location</Text>
            <TextInput
              style={styles.input}
              value={location}
              onChangeText={setLocation}
              placeholder="Downtown area"
              placeholderTextColor="#bbb"
            />
            <TouchableOpacity style={styles.submitButton} onPress={handleAddSingle}>
              <Ionicons name="add" size={20} color="#fff" />
              <Text style={styles.submitText}>Add Event</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View>
            <Text style={styles.label}>Paste Your Itinerary</Text>
            <Text style={styles.hint}>
              Supported formats:{'\n'}
              - One event per line: Date | Time | Activity | Location{'\n'}
              - Tab-separated or comma-separated{'\n'}
              - Lines starting with a date will be auto-detected
            </Text>
            <TextInput
              style={[styles.input, styles.bulkInput]}
              value={bulkText}
              onChangeText={setBulkText}
              placeholder={'2024-03-15 | 9:00 AM | Visit museum | Downtown\n2024-03-15 | 12:00 PM | Lunch | Beach Cafe\n2024-03-16 | 10:00 AM | Hiking | Mountain Trail'}
              placeholderTextColor="#bbb"
              multiline
              textAlignVertical="top"
            />
            <TouchableOpacity style={styles.submitButton} onPress={handleBulkPaste}>
              <Ionicons name="clipboard" size={20} color="#fff" />
              <Text style={styles.submitText}>Import Events</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

/**
 * Parses bulk pasted text into itinerary events.
 * Supports: pipe-delimited, tab-delimited, comma-delimited
 */
function parseBulkText(text) {
  const lines = text.split('\n').filter((l) => l.trim());
  const events = [];

  for (const line of lines) {
    // Detect delimiter: pipe, tab, or comma
    let parts;
    if (line.includes('|')) {
      parts = line.split('|').map((p) => p.trim());
    } else if (line.includes('\t')) {
      parts = line.split('\t').map((p) => p.trim());
    } else if (line.includes(',')) {
      parts = line.split(',').map((p) => p.trim());
    } else {
      // Try to parse as "Date Activity" format
      const dateMatch = line.match(/^(\d{4}-\d{2}-\d{2}|\d{1,2}\/\d{1,2}\/\d{2,4})\s+(.+)/);
      if (dateMatch) {
        parts = [dateMatch[1], '', dateMatch[2]];
      } else {
        continue; // Skip unparseable lines
      }
    }

    if (parts.length >= 3) {
      events.push({
        date: normalizeDate(parts[0]),
        time: parts[1] || '',
        activity: parts[2] || '',
        location: parts[3] || '',
        latitude: parseFloat(parts[4]) || null,
        longitude: parseFloat(parts[5]) || null,
      });
    }
  }

  return events;
}

function normalizeDate(dateStr) {
  if (!dateStr) return '';
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr;
  const parsed = new Date(dateStr);
  if (!isNaN(parsed.getTime())) return parsed.toISOString().split('T')[0];
  return dateStr;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  scroll: { padding: 20, paddingBottom: 40 },
  heading: { fontSize: 22, fontWeight: '700', color: '#222', marginBottom: 4 },
  subheading: { fontSize: 14, color: '#888', marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '600', color: '#444', marginBottom: 6, marginTop: 12 },
  hint: { fontSize: 12, color: '#999', marginBottom: 8, lineHeight: 18 },
  input: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 12,
    fontSize: 15,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    color: '#222',
  },
  bulkInput: {
    height: 180,
    textAlignVertical: 'top',
  },
  familyRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },
  familyChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: '#e8e8e8',
  },
  familyChipText: { fontSize: 13, fontWeight: '600', color: '#555' },
  modeToggle: {
    flexDirection: 'row',
    marginTop: 20,
    backgroundColor: '#e8e8e8',
    borderRadius: 10,
    padding: 3,
  },
  modeButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  modeActive: { backgroundColor: '#4A90D9' },
  modeText: { fontSize: 14, fontWeight: '600', color: '#666' },
  modeTextActive: { color: '#fff' },
  submitButton: {
    flexDirection: 'row',
    backgroundColor: '#4A90D9',
    borderRadius: 12,
    paddingVertical: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    gap: 8,
  },
  submitText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
