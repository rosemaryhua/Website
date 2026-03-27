import { initializeApp } from 'firebase/app'
import { getDatabase, ref, set, push, onValue, update, remove } from 'firebase/database'

// Replace with your Firebase config from https://console.firebase.google.com
// 1. Create a new project (free tier is fine)
// 2. Add a Web app
// 3. Copy the firebaseConfig object here
// 4. Enable Realtime Database in the console (start in test mode for easy setup)
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL || '',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
}

const isConfigured = firebaseConfig.apiKey && firebaseConfig.databaseURL

let app = null
let db = null

if (isConfigured) {
  app = initializeApp(firebaseConfig)
  db = getDatabase(app)
}

export { db, ref, set, push, onValue, update, remove, isConfigured }
