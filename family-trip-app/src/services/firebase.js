import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  onSnapshot,
  query,
  orderBy,
  addDoc,
  serverTimestamp,
  getDocs,
  deleteDoc,
} from 'firebase/firestore';
import firebaseConfig from '../constants/firebaseConfig';

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// --- Itinerary Operations ---

export function subscribeToItineraries(familyId, callback) {
  const ref = collection(db, 'itineraries', familyId, 'events');
  const q = query(ref, orderBy('date', 'asc'));
  return onSnapshot(q, (snapshot) => {
    const events = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
    callback(events);
  });
}

export async function saveItineraryEvents(familyId, events) {
  const ref = collection(db, 'itineraries', familyId, 'events');

  // Clear existing events for this family
  const existing = await getDocs(ref);
  const deletes = existing.docs.map((d) => deleteDoc(d.ref));
  await Promise.all(deletes);

  // Write new events
  const writes = events.map((event) =>
    addDoc(ref, {
      ...event,
      updatedAt: serverTimestamp(),
    })
  );
  await Promise.all(writes);
}

export async function addItineraryEvent(familyId, event) {
  const ref = collection(db, 'itineraries', familyId, 'events');
  return addDoc(ref, {
    ...event,
    updatedAt: serverTimestamp(),
  });
}

// --- Shared Notes Operations ---

export function subscribeToNotes(callback) {
  const ref = collection(db, 'sharedNotes');
  const q = query(ref, orderBy('createdAt', 'asc'));
  return onSnapshot(q, (snapshot) => {
    const notes = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
    callback(notes);
  });
}

export async function addNote(note) {
  const ref = collection(db, 'sharedNotes');
  return addDoc(ref, {
    ...note,
    createdAt: serverTimestamp(),
  });
}

// --- Family Settings ---

export async function saveFamilySettings(familyId, settings) {
  const ref = doc(db, 'familySettings', familyId);
  return setDoc(ref, { ...settings, updatedAt: serverTimestamp() }, { merge: true });
}

export function subscribeToFamilySettings(familyId, callback) {
  const ref = doc(db, 'familySettings', familyId);
  return onSnapshot(ref, (snapshot) => {
    callback(snapshot.exists() ? snapshot.data() : null);
  });
}

export { db };
