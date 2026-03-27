import { useState, useEffect, useCallback } from 'react'
import { db, ref, set, push, onValue, update, remove, isConfigured } from '../firebase'
import { FAMILIES, DEFAULT_TRIP_DATES } from '../utils/constants'
import { SEED_ITINERARIES, SEED_TRIP_DATES } from '../utils/seedData'

const LOCAL_KEY = 'familyTripData'
const DATA_VERSION_KEY = 'familyTripDataVersion'
const CURRENT_VERSION = 3 // bump this to force a refresh of seed data

function getLocalData() {
  try {
    const storedVersion = parseInt(localStorage.getItem(DATA_VERSION_KEY) || '0')
    if (storedVersion < CURRENT_VERSION) {
      localStorage.removeItem(LOCAL_KEY)
      localStorage.setItem(DATA_VERSION_KEY, String(CURRENT_VERSION))
      return null
    }
    const stored = localStorage.getItem(LOCAL_KEY)
    return stored ? JSON.parse(stored) : null
  } catch {
    return null
  }
}

function saveLocalData(data) {
  localStorage.setItem(LOCAL_KEY, JSON.stringify(data))
  localStorage.setItem(DATA_VERSION_KEY, String(CURRENT_VERSION))
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
  const [data, setData] = useState(() => getLocalData() || defaultData())
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
        setData(val)
        saveLocalData(val)
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
    updateFamilies,
    updateTripDates,
    updateItinerary,
    sendMessage,
    addVote,
    castVote,
    updateSheetsConfig,
    updateMapsConfig,
  }
}
