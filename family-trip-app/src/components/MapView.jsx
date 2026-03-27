import { useMemo, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import { FAMILY_COLORS } from '../utils/constants'

// Custom colored markers for each family
function createFamilyIcon(color) {
  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="
      background: ${color};
      width: 28px;
      height: 28px;
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      border: 3px solid white;
      box-shadow: 0 2px 6px rgba(0,0,0,0.3);
    "></div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 28],
    popupAnchor: [0, -28],
  })
}

function FitBounds({ markers }) {
  const map = useMap()
  useMemo(() => {
    if (markers.length > 0) {
      const bounds = L.latLngBounds(markers.map(m => [m.lat, m.lng]))
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 })
    }
  }, [markers, map])
  return null
}

export default function MapView({ data }) {
  const { families = [], itineraries = {} } = data
  const [filter, setFilter] = useState('all')

  const markers = useMemo(() => {
    const result = []
    for (const family of families) {
      if (filter !== 'all' && filter !== family.id) continue
      const items = itineraries[family.id] || []
      for (const item of items) {
        const lat = parseFloat(item.lat)
        const lng = parseFloat(item.lng)
        if (!isNaN(lat) && !isNaN(lng)) {
          result.push({
            lat, lng,
            familyId: family.id,
            familyName: family.name,
            emoji: family.emoji,
            ...item,
          })
        }
      }
    }
    return result
  }, [families, itineraries, filter])

  const center = markers.length > 0
    ? [markers.reduce((s, m) => s + m.lat, 0) / markers.length, markers.reduce((s, m) => s + m.lng, 0) / markers.length]
    : [40.7128, -74.0060] // Default to NYC

  return (
    <div className="flex flex-col h-full">
      {/* Family filter chips */}
      <div className="flex gap-2 p-3 overflow-x-auto shrink-0 bg-white border-b border-gray-100">
        <button
          onClick={() => setFilter('all')}
          className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
            filter === 'all' ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-600'
          }`}
        >
          All
        </button>
        {families.map(f => {
          const colors = FAMILY_COLORS[f.id]
          return (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
                filter === f.id ? `${colors.bg} text-white` : `${colors.bgLight} ${colors.text}`
              }`}
            >
              {f.emoji} {f.name}
            </button>
          )
        })}
      </div>

      {markers.length === 0 ? (
        <div className="flex-1 flex items-center justify-center p-6 text-center text-gray-500">
          <div>
            <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
            <p className="text-lg mb-2">No locations on the map yet</p>
            <p className="text-sm">Add latitude & longitude to your itinerary items to see them on the map. Include "lat" and "lng" columns in your Google Sheet.</p>
          </div>
        </div>
      ) : (
        <div className="flex-1 p-3">
          <MapContainer center={center} zoom={12} className="rounded-xl shadow-inner">
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <FitBounds markers={markers} />
            {markers.map((m, i) => (
              <Marker
                key={i}
                position={[m.lat, m.lng]}
                icon={createFamilyIcon(FAMILY_COLORS[m.familyId].hex)}
              >
                <Popup>
                  <div className="text-sm">
                    <p className="font-bold">{m.emoji} {m.familyName}</p>
                    <p className="font-medium">{m.activity}</p>
                    {m.date && <p className="text-gray-500">{m.date} {m.time}</p>}
                    {m.location && <p className="text-gray-500">{m.location}</p>}
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      )}
    </div>
  )
}
