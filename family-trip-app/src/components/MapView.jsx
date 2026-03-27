import { useState, lazy, Suspense } from 'react'
import { FAMILY_COLORS } from '../utils/constants'
import { MAP_PINS, CITY_CENTERS } from '../utils/mapPins'

const PinMap = lazy(() => import('./PinMap'))

export default function MapView({ data, onUpdateMapsConfig }) {
  const { families = [], mapsConfig = {} } = data
  const [tab, setTab] = useState('lists')
  const [cityFilter, setCityFilter] = useState('Seoul')
  const [addingMap, setAddingMap] = useState(null)
  const [newUrl, setNewUrl] = useState('')
  const [newLabel, setNewLabel] = useState('')

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

  const filteredPins = MAP_PINS.filter(p => p.city === cityFilter)
  const cities = [...new Set(MAP_PINS.map(p => p.city))]

  const openInGoogleMaps = (pin) => {
    window.open(`https://www.google.com/maps/search/?api=1&query=${pin.lat},${pin.lng}`, '_blank')
  }

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
        <div className="flex-1 flex flex-col">
          {/* City filter */}
          <div className="flex gap-2 p-3 overflow-x-auto shrink-0 bg-white border-b border-gray-100">
            {cities.map(city => (
              <button
                key={city}
                onClick={() => setCityFilter(city)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
                  cityFilter === city ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'
                }`}
              >
                {city} ({MAP_PINS.filter(p => p.city === city).length})
              </button>
            ))}
          </div>

          {/* Map */}
          <Suspense fallback={<div className="flex-1 flex items-center justify-center"><p className="text-sm text-gray-400">Loading map...</p></div>}>
            <PinMap cityFilter={cityFilter} />
          </Suspense>

          {/* Pin list below map */}
          <div className="shrink-0 max-h-[40%] overflow-y-auto border-t border-gray-200">
            <div className="divide-y divide-gray-100">
              {filteredPins.map((pin, i) => (
                <button
                  key={i}
                  onClick={() => openInGoogleMaps(pin)}
                  className="w-full px-4 py-2.5 flex items-center gap-3 hover:bg-gray-50 active:bg-gray-100 transition-colors text-left"
                >
                  <div className="w-6 h-6 rounded-full bg-red-500 flex items-center justify-center text-white shrink-0">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                    </svg>
                  </div>
                  <p className="flex-1 text-sm font-medium text-gray-900 truncate">{pin.name}</p>
                  <svg className="w-4 h-4 text-gray-300 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
