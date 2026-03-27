export const FAMILIES = [
  { id: 'family1', name: 'Hua Family', color: 'family-1', emoji: '🥟' },
  { id: 'family2', name: 'Ku Family', color: 'family-2', emoji: '🥃' },
  { id: 'family3', name: 'Kim Family', color: 'family-3', emoji: '🥘' },
  { id: 'family4', name: 'DeAragon Family', color: 'family-4', emoji: '🍜' },
]

export const FAMILY_COLORS = {
  family1: { bg: 'bg-family-1', bgLight: 'bg-family-1-light', text: 'text-family-1', border: 'border-family-1', hex: '#3b82f6' },
  family2: { bg: 'bg-family-2', bgLight: 'bg-family-2-light', text: 'text-family-2', border: 'border-family-2', hex: '#10b981' },
  family3: { bg: 'bg-family-3', bgLight: 'bg-family-3-light', text: 'text-family-3', border: 'border-family-3', hex: '#f59e0b' },
  family4: { bg: 'bg-family-4', bgLight: 'bg-family-4-light', text: 'text-family-4', border: 'border-family-4', hex: '#ef4444' },
}

export const DEFAULT_TRIP_DATES = {
  start: new Date().toISOString().split('T')[0],
  end: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
}
