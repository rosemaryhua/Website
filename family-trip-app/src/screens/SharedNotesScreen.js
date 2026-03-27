import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTrip } from '../context/TripContext';
import { addNote } from '../services/firebase';
import { FAMILIES } from '../constants/families';

export default function SharedNotesScreen() {
  const { notes } = useTrip();
  const [message, setMessage] = useState('');
  const [senderFamily, setSenderFamily] = useState(FAMILIES[0].id);
  const flatListRef = useRef(null);

  useEffect(() => {
    // Auto-scroll to bottom when new notes arrive
    if (notes.length > 0) {
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }, [notes.length]);

  async function handleSend() {
    if (!message.trim()) return;

    const family = FAMILIES.find((f) => f.id === senderFamily);
    try {
      await addNote({
        text: message.trim(),
        familyId: senderFamily,
        familyName: family?.name || 'Unknown',
        familyColor: family?.color || '#999',
        familyEmoji: family?.emoji || '',
      });
      setMessage('');
    } catch (err) {
      console.error('Failed to send note:', err);
    }
  }

  function renderNote({ item }) {
    const isCurrentFamily = item.familyId === senderFamily;

    return (
      <View
        style={[
          styles.noteContainer,
          isCurrentFamily ? styles.noteRight : styles.noteLeft,
        ]}
      >
        <View
          style={[
            styles.bubble,
            {
              backgroundColor: isCurrentFamily
                ? item.familyColor || '#4A90D9'
                : '#fff',
            },
          ]}
        >
          {!isCurrentFamily && (
            <Text style={styles.senderName}>
              {item.familyEmoji} {item.familyName}
            </Text>
          )}
          <Text
            style={[
              styles.noteText,
              { color: isCurrentFamily ? '#fff' : '#222' },
            ]}
          >
            {item.text}
          </Text>
          <Text
            style={[
              styles.timestamp,
              { color: isCurrentFamily ? 'rgba(255,255,255,0.7)' : '#bbb' },
            ]}
          >
            {formatTimestamp(item.createdAt)}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={90}
    >
      {/* Family Selector */}
      <View style={styles.senderBar}>
        <Text style={styles.senderLabel}>Sending as:</Text>
        {FAMILIES.map((family) => (
          <TouchableOpacity
            key={family.id}
            style={[
              styles.senderChip,
              senderFamily === family.id && { backgroundColor: family.color },
            ]}
            onPress={() => setSenderFamily(family.id)}
          >
            <Text
              style={[
                styles.senderChipText,
                senderFamily === family.id && { color: '#fff' },
              ]}
            >
              {family.emoji}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Messages */}
      <FlatList
        ref={flatListRef}
        data={notes}
        keyExtractor={(item) => item.id}
        renderItem={renderNote}
        contentContainerStyle={styles.messageList}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="chatbubbles-outline" size={48} color="#ddd" />
            <Text style={styles.emptyText}>No messages yet</Text>
            <Text style={styles.emptySubtext}>
              Share notes, updates, and coordinate with other families
            </Text>
          </View>
        }
      />

      {/* Input */}
      <View style={styles.inputBar}>
        <TextInput
          style={styles.input}
          value={message}
          onChangeText={setMessage}
          placeholder="Share a note with everyone..."
          placeholderTextColor="#bbb"
          multiline
          maxLength={500}
        />
        <TouchableOpacity
          style={[
            styles.sendButton,
            { backgroundColor: message.trim() ? '#4A90D9' : '#ddd' },
          ]}
          onPress={handleSend}
          disabled={!message.trim()}
        >
          <Ionicons
            name="send"
            size={20}
            color={message.trim() ? '#fff' : '#999'}
          />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

function formatTimestamp(ts) {
  if (!ts) return '';
  try {
    const date = ts.toDate ? ts.toDate() : new Date(ts);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    });
  } catch {
    return '';
  }
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f0f0' },
  senderBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    gap: 8,
  },
  senderLabel: { fontSize: 13, color: '#888', fontWeight: '500' },
  senderChip: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  senderChipText: { fontSize: 16 },
  messageList: { padding: 16, paddingBottom: 8, flexGrow: 1 },
  noteContainer: { marginBottom: 8, maxWidth: '80%' },
  noteLeft: { alignSelf: 'flex-start' },
  noteRight: { alignSelf: 'flex-end' },
  bubble: {
    borderRadius: 16,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
    elevation: 1,
  },
  senderName: {
    fontSize: 12,
    fontWeight: '700',
    color: '#888',
    marginBottom: 4,
  },
  noteText: { fontSize: 15, lineHeight: 20 },
  timestamp: { fontSize: 10, marginTop: 4, textAlign: 'right' },
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 80,
  },
  emptyText: { fontSize: 16, color: '#bbb', marginTop: 12, fontWeight: '600' },
  emptySubtext: { fontSize: 13, color: '#ddd', marginTop: 4, textAlign: 'center', paddingHorizontal: 40 },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    gap: 8,
  },
  input: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    maxHeight: 100,
    color: '#222',
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
