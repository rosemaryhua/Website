# Family Trip Coordinator - Setup Guide

A React Native (Expo) app for 4 families to coordinate their trip itineraries, share notes, and find meetup opportunities.

## Features

- **Unified Itinerary View** - See all 4 family itineraries in one timeline
- **Google Sheets Auto-Sync** - Families using Google Sheets get automatic updates every 60 seconds
- **Manual Entry / Bulk Paste** - Families using Apple Notes can paste their itinerary text
- **Overlap Detection** - Automatically detects when families are at the same place/time
- **Interactive Map** - See all planned locations with color-coded family markers
- **Combined Calendar** - Multi-dot calendar showing which families have events each day
- **Group Chat** - Real-time shared notes and messages between families

## Prerequisites

- Node.js 18+
- Expo CLI: `npm install -g expo-cli`
- A Firebase project (free tier works)
- A Google Cloud API key with Sheets API enabled (for auto-sync families)

## Setup Steps

### 1. Install Dependencies

```bash
cd family-trip-app
npm install
```

### 2. Configure Firebase

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project (or use an existing one)
3. Enable **Cloud Firestore** (start in test mode for development)
4. Go to Project Settings > General > Your Apps > Add a Web App
5. Copy the config values into `src/constants/firebaseConfig.js`

### 3. Configure Google Sheets API (for auto-sync families)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Enable the **Google Sheets API**
3. Create an API key (restrict to Sheets API)
4. Paste the API key in `src/services/googleSheets.js` (replace `YOUR_GOOGLE_SHEETS_API_KEY`)
5. Make each family's Google Sheet publicly readable (Share > Anyone with link > Viewer)

### 4. Configure Families

Edit `src/constants/families.js` to:
- Set each family's name and emoji
- Set `sourceType` to `'google_sheets'` or `'manual'`
- For Google Sheets families, set `sheetId` (the ID from the Sheet URL: `https://docs.google.com/spreadsheets/d/SHEET_ID_HERE/edit`)

### 5. Google Sheets Format

Set up your Google Sheets with these columns (row 1 = headers):

| Date | Time | Activity | Location | Latitude | Longitude |
|------|------|----------|----------|----------|-----------|
| 2024-03-15 | 9:00 AM | Visit Museum | Downtown | 37.7749 | -122.4194 |

Latitude/Longitude are optional but needed for the map view.

### 6. Configure Google Maps (for Map view)

1. Get a Google Maps API key from [Google Cloud Console](https://console.cloud.google.com/)
2. Enable **Maps SDK for iOS** and **Maps SDK for Android**
3. Add the key in `app.json` (replace `YOUR_GOOGLE_MAPS_API_KEY`)

### 7. Run the App

```bash
npx expo start
```

Scan the QR code with Expo Go on your phone, or press `i` for iOS simulator / `a` for Android emulator.

## How It Works

### For families using Google Sheets:
The app polls each family's Google Sheet every 60 seconds. When changes are detected, the new data is pushed to Firebase, which broadcasts it to all connected devices in real-time.

### For families using Apple Notes:
Open the app > Trips tab > tap the + button > select "Bulk Paste" > paste the itinerary text from Apple Notes. The app parses the text and stores events in Firebase.

### Overlap Detection:
The app automatically compares all family itineraries and detects when 2+ families will be at the same location on the same day. It uses exact location name matching and, when coordinates are available, proximity detection (within 1km).
