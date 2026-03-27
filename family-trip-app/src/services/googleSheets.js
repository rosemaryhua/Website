// Google Sheets API service
// Uses the Google Sheets REST API with an API key for read-only access.
// To use: make the Google Sheet publicly readable (Share > Anyone with link > Viewer)
// and provide a Google Sheets API key.

const SHEETS_API_BASE = 'https://sheets.googleapis.com/v4/spreadsheets';

// Set your API key here or in environment config
let API_KEY = 'YOUR_GOOGLE_SHEETS_API_KEY';

export function setApiKey(key) {
  API_KEY = key;
}

/**
 * Fetches itinerary data from a Google Sheet.
 *
 * Expected sheet columns: Date | Time | Activity | Location | Latitude | Longitude
 *
 * @param {string} sheetId - The Google Sheets document ID (from the URL)
 * @param {string} range - The cell range, e.g. "Sheet1!A2:F" (skip header row)
 * @returns {Array} Parsed itinerary events
 */
export async function fetchSheetData(sheetId, range = 'Sheet1!A2:F') {
  if (!sheetId) {
    throw new Error('No Google Sheet ID provided');
  }

  const url = `${SHEETS_API_BASE}/${sheetId}/values/${encodeURIComponent(range)}?key=${API_KEY}`;

  const response = await fetch(url);
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Google Sheets API error: ${response.status} - ${error}`);
  }

  const data = await response.json();
  const rows = data.values || [];

  return rows
    .filter((row) => row.length >= 3) // At minimum: date, time, activity
    .map((row, index) => ({
      id: `sheet-${index}`,
      date: normalizeDate(row[0] || ''),
      time: row[1] || '',
      activity: row[2] || '',
      location: row[3] || '',
      latitude: parseFloat(row[4]) || null,
      longitude: parseFloat(row[5]) || null,
    }));
}

/**
 * Normalizes date strings into YYYY-MM-DD format.
 * Handles common formats: MM/DD/YYYY, DD/MM/YYYY, YYYY-MM-DD, Month DD YYYY
 */
function normalizeDate(dateStr) {
  if (!dateStr) return '';

  // Already in YYYY-MM-DD format
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return dateStr;
  }

  // Try native Date parsing as fallback
  const parsed = new Date(dateStr);
  if (!isNaN(parsed.getTime())) {
    return parsed.toISOString().split('T')[0];
  }

  return dateStr; // Return as-is if unparseable
}

/**
 * Starts a polling interval to sync Google Sheets data periodically.
 *
 * @param {string} sheetId
 * @param {string} range
 * @param {function} onData - Callback with parsed events
 * @param {number} intervalMs - Poll interval in milliseconds (default 60s)
 * @returns {function} cleanup function to stop polling
 */
export function startSheetSync(sheetId, range, onData, intervalMs = 60000) {
  let active = true;

  async function poll() {
    if (!active) return;
    try {
      const events = await fetchSheetData(sheetId, range);
      onData(events, null);
    } catch (error) {
      onData(null, error);
    }
    if (active) {
      setTimeout(poll, intervalMs);
    }
  }

  // Initial fetch
  poll();

  return () => {
    active = false;
  };
}
