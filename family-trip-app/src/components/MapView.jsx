import { useMemo, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import { FAMILY_COLORS } from '../utils/constants'

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

export default function MapView({ data, onUpdateMapsConfig }) {
  const { families = [], itineraries = {}, mapsConfig = {} } = data
  const [filter, setFilter] = useState('all')
  const [tab, setTab] = useState('lists') // 'lists' or 'pins'
  const [addingMap, setAddingMap] = useState(null)
  const [newUrl, setNewUrl] = useState('')
  const [newLabel, setNewLabel] = useState('')

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
    : [37.5665, 126.978] // Default to Seoul

  const handleAddMap = (familyId) => {
    if (!newUrl.trim()) return
    const existing = mapsConfig[familyId] || []
    const updated = [...existing, { url: newUrl.trim(), label: newLabel.trim() || 'Saved Places' }]
    onUpdateMapsConfig(familyId, updated)
    setNewUrl('')
    setNewLabel('')
    setAddingMap(null)
  }

  const handleRemoveMap = (familyId, index) => {
    const existing = mapsConfig[familyId] || []
    const updated = existing.filter((_, i) => i !== index)
    onUpdateMapsConfig(familyId, updated)
  }

  const allMapsEmpty = families.every(f => !(mapsConfig[f.id]?.length > 0))

  return (
    <div className="flex flex-col h-full">
      {/* Tab switcher */}
      <div className="flex rounded-lg bg-gray-100 p-1 mx-3 mt-3 shrink-0">
        <button
          onClick={() => setTab('lists')}
          className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${
            tab === 'lists' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500'
          }`}
        >
          Saved Maps
        </button>
        <button
          onClick={() => setTab('pins')}
          className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${
            tab === 'pins' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500'
          }`}
        >
          Activity Pins
        </button>
      </div>

      {tab === 'lists' ? (
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <p className="text-xs text-gray-500">
            Share your Google Maps saved lists here. Tapping a list opens it in Google Maps on your phone.
          </p>

          {families.map(f => {
            const colors = FAMILY_COLORS[f.id]
            const maps = mapsConfig[f.id] || []

            return (
              <div key={f.id} className={`rounded-xl border-2 ${colors.border} overflow-hidden`}>
                <div className={`${colors.bg} text-white px-4 py-2 flex items-center gap-2`}>
                  <span>{f.emoji}</span>
                  <span className="font-semibold">{f.name}</span>
                  <button
                    onClick={() => { setAddingMap(addingMap === f.id ? null : f.id); setNewUrl(''); setNewLabel('') }}
                    className="ml-auto text-sm bg-white/20 px-2 py-0.5 rounded-full hover:bg-white/30"
                  >
                    + Add
                  </button>
                </div>

                <div className="divide-y divide-gray-100">
                  {maps.length === 0 && addingMap !== f.id && (
                    <div className="px-4 py-3 text-gray-400 text-sm italic">
                      No saved maps yet
                    </div>
                  )}

                  {maps.map((m, i) => (
                    <div key={i} className="px-4 py-3 flex items-center gap-3">
                      <svg className="w-5 h-5 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                      </svg>
                      <a
                        href={m.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`flex-1 font-medium ${colors.text} underline underline-offset-2`}
                      >
                        {m.label}
                      </a>
                      <button
                        onClick={() => handleRemoveMap(f.id, i)}
                        className="text-gray-300 hover:text-red-400 text-xs"
                      >
                        Remove
                      </button>
                    </div>
                  ))}

                  {addingMap === f.id && (
                    <div className="px-4 py-3 space-y-2 bg-gray-50">
                      <input
                        type="text"
                        value={newLabel}
                        onChange={(e) => setNewLabel(e.target.value)}
                        placeholder="Label (e.g. Seoul Restaurants)"
                        className="w-full px-3 py-2 border rounded-lg text-sm"
                        autoFocus
                      />
                      <input
                        type="url"
                        value={newUrl}
                        onChange={(e) => setNewUrl(e.target.value)}
                        placeholder="Google Maps link (maps.app.goo.gl/...)"
                        className="w-full px-3 py-2 border rounded-lg text-sm"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleAddMap(f.id)}
                          disabled={!newUrl.trim()}
                          className="px-4 py-1.5 bg-green-600 text-white rounded-lg text-sm font-medium disabled:opacity-50"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setAddingMap(null)}
                          className="px-4 py-1.5 bg-gray-200 text-gray-700 rounded-lg text-sm"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <>
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
                <p className="text-lg mb-2">No activity pins yet</p>
                <p className="text-sm">Add "lat" and "lng" columns to your Google Sheet to see activities pinned on the map.</p>
              </div>
            </div>
          ) : (
            <div className="flex-1 p-3" style={{ minHeight: '400px' }}>
              <MapContainer center={center} zoom={12} className="rounded-xl shadow-inner" style={{ height: '100%', minHeight: '400px' }}>
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
        </>
      )}
    </div>
  )
}
