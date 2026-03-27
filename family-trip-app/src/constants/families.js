export const FAMILIES = [
  {
    id: 'family-1',
    name: 'Family 1',
    color: '#4A90D9',
    emoji: '🏠',
    sourceType: 'google_sheets', // 'google_sheets' or 'manual'
    sheetId: '', // Google Sheet ID if applicable
    sheetRange: 'Sheet1!A:F', // Default range
  },
  {
    id: 'family-2',
    name: 'Family 2',
    color: '#E8645A',
    emoji: '🏡',
    sourceType: 'google_sheets',
    sheetId: '',
    sheetRange: 'Sheet1!A:F',
  },
  {
    id: 'family-3',
    name: 'Family 3',
    color: '#50B86C',
    emoji: '🏘',
    sourceType: 'manual', // Apple Notes - manual paste
    sheetId: '',
    sheetRange: '',
  },
  {
    id: 'family-4',
    name: 'Family 4',
    color: '#F5A623',
    emoji: '🏰',
    sourceType: 'manual',
    sheetId: '',
    sheetRange: '',
  },
];

export const FAMILY_COLORS = {
  'family-1': '#4A90D9',
  'family-2': '#E8645A',
  'family-3': '#50B86C',
  'family-4': '#F5A623',
};

// Expected columns in Google Sheets:
// Date | Time | Activity | Location | Latitude | Longitude
// For manual entry, the same fields are collected via a form.
export const ITINERARY_FIELDS = [
  'date',
  'time',
  'activity',
  'location',
  'latitude',
  'longitude',
];
