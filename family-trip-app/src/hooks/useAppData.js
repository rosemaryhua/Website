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

  const updateItinerary = useCallback((familyId, itinerary) => {
    const updated = {
      ...data,
      itineraries: { ...data.itineraries, [familyId]: itinerary },
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
