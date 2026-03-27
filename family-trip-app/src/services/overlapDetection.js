import { FAMILIES } from '../constants/families';

/**
 * Detects overlaps between family itineraries.
 * An overlap occurs when 2+ families are at the same location on the same date,
 * or within a configurable radius if coordinates are available.
 *
 * @param {Object} allItineraries - { familyId: [events] }
 * @param {Object} options
 * @param {number} options.radiusKm - Proximity radius in km (default 1km)
 * @returns {Array} List of overlap objects
 */
export function detectOverlaps(allItineraries, options = {}) {
  const { radiusKm = 1 } = options;
  const overlaps = [];

  // Flatten all events with family info
  const allEvents = [];
  for (const [familyId, events] of Object.entries(allItineraries)) {
    const family = FAMILIES.find((f) => f.id === familyId);
    for (const event of events) {
      allEvents.push({
        ...event,
        familyId,
        familyName: family?.name || familyId,
        familyColor: family?.color || '#999',
      });
    }
  }

  // Group events by date
  const byDate = {};
  for (const event of allEvents) {
    if (!event.date) continue;
    if (!byDate[event.date]) byDate[event.date] = [];
    byDate[event.date].push(event);
  }

  // Check each date for overlaps
  for (const [date, events] of Object.entries(byDate)) {
    if (events.length < 2) continue;

    // Check pairs of events from different families
    for (let i = 0; i < events.length; i++) {
      for (let j = i + 1; j < events.length; j++) {
        const a = events[i];
        const b = events[j];

        if (a.familyId === b.familyId) continue;

        const isOverlap = checkProximity(a, b, radiusKm);
        if (isOverlap) {
          // Check if we already have an overlap for this date+location group
          const existing = overlaps.find(
            (o) =>
              o.date === date &&
              o.families.includes(a.familyId) &&
              o.families.includes(b.familyId) &&
              o.location === (a.location || b.location)
          );

          if (existing) continue;

          overlaps.push({
            id: `overlap-${date}-${a.familyId}-${b.familyId}`,
            date,
            location: a.location || b.location || 'Same area',
            families: [a.familyId, b.familyId],
            familyNames: [a.familyName, b.familyName],
            familyColors: [a.familyColor, b.familyColor],
            events: [a, b],
            type: a.latitude && b.latitude ? 'proximity' : 'location_match',
          });
        }
      }
    }
  }

  // Merge overlaps that share date + location into multi-family overlaps
  return mergeOverlaps(overlaps);
}

function checkProximity(a, b, radiusKm) {
  // If both have coordinates, check distance
  if (a.latitude && a.longitude && b.latitude && b.longitude) {
    const distance = haversineDistance(
      a.latitude,
      a.longitude,
      b.latitude,
      b.longitude
    );
    return distance <= radiusKm;
  }

  // Fall back to location name matching
  if (a.location && b.location) {
    return normalizeLocation(a.location) === normalizeLocation(b.location);
  }

  return false;
}

function normalizeLocation(loc) {
  return loc.toLowerCase().trim().replace(/[^a-z0-9]/g, '');
}

function haversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(deg) {
  return (deg * Math.PI) / 180;
}

function mergeOverlaps(overlaps) {
  const merged = [];

  for (const overlap of overlaps) {
    const existing = merged.find(
      (m) => m.date === overlap.date && m.location === overlap.location
    );

    if (existing) {
      // Add new families to existing overlap
      for (let i = 0; i < overlap.families.length; i++) {
        if (!existing.families.includes(overlap.families[i])) {
          existing.families.push(overlap.families[i]);
          existing.familyNames.push(overlap.familyNames[i]);
          existing.familyColors.push(overlap.familyColors[i]);
        }
      }
      existing.events.push(...overlap.events.filter(
        (e) => !existing.events.some((ex) => ex.familyId === e.familyId && ex.activity === e.activity)
      ));
    } else {
      merged.push({ ...overlap });
    }
  }

  return merged.sort((a, b) => a.date.localeCompare(b.date));
}
