import { useState, useEffect, useCallback } from 'react'
import { db, ref, set, push, onValue, update, remove, isConfigured } from '../firebase'
import { FAMILIES, DEFAULT_TRIP_DATES } from '../utils/constants'
import { SEED_ITINERARIES, SEED_TRIP_DATES } from '../utils/seedData'

const LOCAL_KEY = 'familyTripData'

function getLocalData() {
  try {
    const stored = localStorage.getItem(LOCAL_KEY)
    return stored ? JSON.parse(stored) : null
  } catch {
    return null
  }
}

function saveLocalData(data) {
  localStorage.setItem(LOCAL_KEY, JSON.stringify(data))
}

const defaultData = () => ({
  families: FAMILIES.map(f => ({ ...f })),
  tripDates: { ...SEED_TRIP_DATES },
  itineraries: { ...SEED_ITINERARIES },
  chat: [],
  votes: [],
  sheetsConfig: {},
  mapsConfig: {
    family2: [{ url: 'https://maps.app.goo.gl/UeKnYUfDqdMKfEJF8', label: 'Ku Family Saved Places' }],
  },
})

export function useAppData() {
  // If Firebase is configured, start with local cache or empty state.
  // Firebase will send the real data momentarily via onValue.
  // Only use seed data as fallback if Firebase is NOT configured.
  const [data, setData] = useState(() => {
    const local = getLocalData()
    if (local) return local
    if (isConfigured) return defaultData() // temporary until Firebase loads
    return defaultData()
  })
  const [connected, setConnected] = useState(false)

  useEffect(() => {
    if (!isConfigured) {
      setConnected(false)
      return
    }

    const dataRef = ref(db, 'tripData')
    const unsub = onValue(dataRef, (snapshot) => {
      const val = snapshot.val()
      if (val) {
        // Firebase has data — use it as source of truth
        setData(val)
        saveLocalData(val)
      } else {
        // Firebase is empty (first time) — seed it with defaults
        const seed = defaultData()
        set(ref(db, 'tripData'), seed)
        setData(seed)
        saveLocalData(seed)
      }
      setConnected(true)
    }, () => {
      setConnected(false)
    })

    return () => unsub()
  }, [])

  const persist = useCallback((newData) => {
    saveLocalData(newData)
    if (isConfigured) {
      set(ref(db, 'tripData'), newData)
    }
  }, [])

  const resetToDefaults = useCallback(() => {
    const fresh = defaultData()
    // Preserve user-generated content (votes, chat, maps)
    fresh.votes = data.votes || []
    fresh.chat = data.chat || []
    fresh.mapsConfig = data.mapsConfig || {}
    setData(fresh)
    saveLocalData(fresh)
    if (isConfigured) {
      set(ref(db, 'tripData'), fresh)
    }
  }, [data, persist])

  const updateFamilies = useCallback((families) => {
    const updated = { ...data, families }
    setData(updated)
    persist(updated)
  }, [data, persist])

  const updateTripDates = useCallback((tripDates) => {
    const updated = { ...data, tripDates }
    setData(updated)
    persist(updated)
  }, [data, persist])

  const addLog = useCallback((entry) => {
    const log = [...(data.activityLog || []), { ...entry, id: Date.now(), timestamp: new Date().toISOString() }]
    // Keep last 200 entries
    return log.slice(-200)
  }, [data])

  const updateItinerary = useCallback((familyId, itinerary) => {
    const oldItems = data.itineraries?.[familyId] || []
    const newItems = itinerary

    // Detect changes for the log
    const familyName = (data.families || []).find(f => f.id === familyId)?.name || familyId
    const logs = []

    if (newItems.length > oldItems.length) {
      // Find added items
      const oldSet = new Set(oldItems.map(i => `${i.date}|${i.time}|${i.activity}`))
      for (const item of newItems) {
        if (!oldSet.has(`${item.date}|${item.time}|${item.activity}`)) {
          logs.push({ type: 'added', familyId, familyName, activity: item.activity, date: item.date, time: item.time })
        }
      }
    } else if (newItems.length < oldItems.length) {
      // Find removed items
      const newSet = new Set(newItems.map(i => `${i.date}|${i.time}|${i.activity}`))
      for (const item of oldItems) {
        if (!newSet.has(`${item.date}|${item.time}|${item.activity}`)) {
          logs.push({ type: 'deleted', familyId, familyName, activity: item.activity, date: item.date, time: item.time })
        }
      }
    } else {
      // Same length — check for edits
      for (let i = 0; i < newItems.length; i++) {
        const o = oldItems[i]
        const n = newItems[i]
        if (o && (o.activity !== n.activity || o.time !== n.time || o.date !== n.date || o.location !== n.location)) {
          logs.push({ type: 'edited', familyId, familyName, activity: n.activity, oldActivity: o.activity, date: n.date, time: n.time })
        }
      }
    }

    let activityLog = data.activityLog || []
    for (const entry of logs) {
      activityLog = [...activityLog, { ...entry, id: Date.now() + Math.random(), timestamp: new Date().toISOString() }]
    }
    activityLog = activityLog.slice(-200)

    const updated = {
      ...data,
      itineraries: { ...data.itineraries, [familyId]: itinerary },
      activityLog,
    }
    setData(updated)
    persist(updated)
  }, [data, persist])

  const sendMessage = useCallback((message) => {
    const chat = [...(data.chat || []), { ...message, id: Date.now(), timestamp: new Date().toISOString() }]
    const updated = { ...data, chat }
    setData(updated)
    persist(updated)
  }, [data, persist])

  const addVote = useCallback((proposal) => {
    const votes = [...(data.votes || []), { ...proposal, id: Date.now(), votes: {}, timestamp: new Date().toISOString() }]
    const updated = { ...data, votes }
    setData(updated)
    persist(updated)
  }, [data, persist])

  const editVote = useCallback((proposalId, updates) => {
    const votes = (data.votes || []).map(v => {
      if (v.id === proposalId) {
        return { ...v, ...updates }
      }
      return v
    })
    const updated = { ...data, votes }
    setData(updated)
    persist(updated)
  }, [data, persist])

  const deleteVote = useCallback((proposalId) => {
    const votes = (data.votes || []).filter(v => v.id !== proposalId)
    const updated = { ...data, votes }
    setData(updated)
    persist(updated)
  }, [data, persist])

  const castVote = useCallback((proposalId, familyId, vote) => {
    const votes = (data.votes || []).map(v => {
      if (v.id === proposalId) {
        return { ...v, votes: { ...v.votes, [familyId]: vote } }
      }
      return v
    })
    const updated = { ...data, votes }
    setData(updated)
    persist(updated)
  }, [data, persist])

  const updateSheetsConfig = useCallback((familyId, config) => {
    const updated = {
      ...data,
      sheetsConfig: { ...data.sheetsConfig, [familyId]: config },
    }
    setData(updated)
    persist(updated)
  }, [data, persist])

  const updateMapsConfig = useCallback((familyId, maps) => {
    const updated = {
      ...data,
      mapsConfig: { ...data.mapsConfig, [familyId]: maps },
    }
    setData(updated)
    persist(updated)
  }, [data, persist])

  return {
    data,
    connected,
    isConfigured,
    resetToDefaults,
    updateFamilies,
    updateTripDates,
    updateItinerary,
    sendMessage,
    addVote,
    editVote,
    deleteVote,
    castVote,
    updateSheetsConfig,
    updateMapsConfig,
  }
}
