import { useState, useCallback } from 'react'

// Extracts sheet ID from various Google Sheets URL formats
function extractSheetId(url) {
  const match = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/)
  return match ? match[1] : null
}

// Fetches data from a published Google Sheet using the public CSV export
// The sheet must be published: File > Share > Publish to web > CSV
export function useGoogleSheets() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchSheet = useCallback(async (url, sheetName = '') => {
    setLoading(true)
    setError(null)

    try {
      const sheetId = extractSheetId(url)
      if (!sheetId) {
        throw new Error('Invalid Google Sheets URL. Please use a URL like: https://docs.google.com/spreadsheets/d/SHEET_ID/...')
      }

      // Use the public CSV export endpoint
      const gidParam = sheetName ? `&sheet=${encodeURIComponent(sheetName)}` : ''
      const csvUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv${gidParam}`

      const response = await fetch(csvUrl)
      if (!response.ok) {
        throw new Error('Could not fetch sheet. Make sure it is published to the web (File > Share > Publish to web).')
      }

      const csvText = await response.text()
      const rows = parseCSV(csvText)

      if (rows.length < 2) {
        throw new Error('Sheet appears to be empty or has no data rows.')
      }

      // First row is headers, rest are data
      const headers = rows[0]
      const items = rows.slice(1).map(row => {
        const item = {}
        headers.forEach((header, i) => {
          item[header.trim().toLowerCase()] = row[i]?.trim() || ''
        })
        return item
      }).filter(item => Object.values(item).some(v => v))

      // Try to parse into itinerary format
      const itinerary = parseItinerary(items)
      setLoading(false)
      return itinerary
    } catch (err) {
      setError(err.message)
      setLoading(false)
      return null
    }
  }, [])

  return { fetchSheet, loading, error }
}

function parseCSV(text) {
  const rows = []
  let current = ''
  let inQuotes = false
  const chars = text.split('')

  for (let i = 0; i < chars.length; i++) {
    const c = chars[i]
    if (c === '"') {
      if (inQuotes && chars[i + 1] === '"') {
        current += '"'
        i++
      } else {
        inQuotes = !inQuotes
      }
    } else if (c === ',' && !inQuotes) {
      rows.length === 0 ? rows.push([current]) : rows[rows.length - 1].push(current)
      current = ''
    } else if ((c === '\n' || (c === '\r' && chars[i + 1] === '\n')) && !inQuotes) {
      if (c === '\r') i++
      if (rows.length === 0) {
        rows.push([current])
      } else {
        rows[rows.length - 1].push(current)
      }
      rows.push([])
      current = ''
    } else {
      current += c
    }
  }

  if (current || (rows.length > 0 && rows[rows.length - 1].length > 0)) {
    if (rows.length === 0) rows.push([])
    rows[rows.length - 1].push(current)
  }

  return rows.filter(r => r.length > 0)
}

// Tries to intelligently parse itinerary data from various column formats
function parseItinerary(items) {
  const dateKeys = ['date', 'day', 'when']
  const timeKeys = ['time', 'start', 'start time', 'begins']
  const activityKeys = ['activity', 'event', 'what', 'plan', 'description', 'title', 'name']
  const locationKeys = ['location', 'place', 'where', 'address', 'venue']
  const notesKeys = ['notes', 'details', 'info', 'comments']

  const findKey = (item, candidates) => {
    const keys = Object.keys(item)
    for (const c of candidates) {
      const found = keys.find(k => k.toLowerCase().includes(c))
      if (found) return found
    }
    return null
  }

  const sample = items[0]
  const dateKey = findKey(sample, dateKeys)
  const timeKey = findKey(sample, timeKeys)
  const activityKey = findKey(sample, activityKeys)
  const locationKey = findKey(sample, locationKeys)
  const notesKey = findKey(sample, notesKeys)

  return items.map(item => ({
    date: dateKey ? item[dateKey] : '',
    time: timeKey ? item[timeKey] : '',
    activity: activityKey ? item[activityKey] : Object.values(item).find(v => v) || '',
    location: locationKey ? item[locationKey] : '',
    notes: notesKey ? item[notesKey] : '',
    lat: item.lat || item.latitude || '',
    lng: item.lng || item.longitude || item.lon || '',
  }))
}
