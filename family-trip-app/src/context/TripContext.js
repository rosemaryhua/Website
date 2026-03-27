import React, { createContext, useContext, useEffect, useReducer, useCallback } from 'react';
import { FAMILIES } from '../constants/families';
import { subscribeToItineraries, saveItineraryEvents, subscribeToNotes } from '../services/firebase';
import { startSheetSync } from '../services/googleSheets';
import { detectOverlaps } from '../services/overlapDetection';

const TripContext = createContext(null);

const initialState = {
  // { familyId: [events] }
  itineraries: {},
  // Detected overlaps
  overlaps: [],
  // Shared notes/messages
  notes: [],
  // Currently selected family (for filtering)
  selectedFamily: null,
  // Loading states
  loading: true,
  // Sync errors per family
  syncErrors: {},
};

function tripReducer(state, action) {
  switch (action.type) {
    case 'SET_ITINERARY': {
      const newItineraries = {
        ...state.itineraries,
        [action.familyId]: action.events,
      };
      return {
        ...state,
        itineraries: newItineraries,
        overlaps: detectOverlaps(newItineraries),
        loading: false,
      };
    }
    case 'SET_NOTES':
      return { ...state, notes: action.notes };
    case 'SET_SELECTED_FAMILY':
      return { ...state, selectedFamily: action.familyId };
    case 'SET_SYNC_ERROR':
      return {
        ...state,
        syncErrors: { ...state.syncErrors, [action.familyId]: action.error },
      };
    case 'CLEAR_SYNC_ERROR': {
      const errors = { ...state.syncErrors };
      delete errors[action.familyId];
      return { ...state, syncErrors: errors };
    }
    default:
      return state;
  }
}

export function TripProvider({ children }) {
  const [state, dispatch] = useReducer(tripReducer, initialState);

  useEffect(() => {
    const unsubscribers = [];

    for (const family of FAMILIES) {
      // Subscribe to Firebase for real-time itinerary updates
      const unsub = subscribeToItineraries(family.id, (events) => {
        dispatch({ type: 'SET_ITINERARY', familyId: family.id, events });
        dispatch({ type: 'CLEAR_SYNC_ERROR', familyId: family.id });
      });
      unsubscribers.push(unsub);

      // For Google Sheets families, also start polling sync
      if (family.sourceType === 'google_sheets' && family.sheetId) {
        const stopSync = startSheetSync(
          family.sheetId,
          family.sheetRange,
          (events, error) => {
            if (error) {
              dispatch({
                type: 'SET_SYNC_ERROR',
                familyId: family.id,
                error: error.message,
              });
              return;
            }
            // Push fetched sheet data to Firebase so all clients stay in sync
            if (events) {
              saveItineraryEvents(family.id, events).catch((err) => {
                dispatch({
                  type: 'SET_SYNC_ERROR',
                  familyId: family.id,
                  error: err.message,
                });
              });
            }
          },
          60000 // sync every 60 seconds
        );
        unsubscribers.push(stopSync);
      }
    }

    // Subscribe to shared notes
    const unsubNotes = subscribeToNotes((notes) => {
      dispatch({ type: 'SET_NOTES', notes });
    });
    unsubscribers.push(unsubNotes);

    return () => unsubscribers.forEach((unsub) => unsub());
  }, []);

  const selectFamily = useCallback((familyId) => {
    dispatch({ type: 'SET_SELECTED_FAMILY', familyId });
  }, []);

  const value = {
    ...state,
    selectFamily,
    dispatch,
  };

  return <TripContext.Provider value={value}>{children}</TripContext.Provider>;
}

export function useTrip() {
  const context = useContext(TripContext);
  if (!context) {
    throw new Error('useTrip must be used within a TripProvider');
  }
  return context;
}

export default TripContext;
