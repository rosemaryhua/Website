import { useState } from 'react'
import { FAMILY_COLORS } from '../utils/constants'
import { useGoogleSheets } from '../hooks/useGoogleSheets'

export default function Settings({
  data,
  onUpdateFamilies, onUpdateTripDates, onUpdateItinerary, onUpdateSheetsConfig,
}) {
  const { families = [], tripDates = {}, sheetsConfig = {}, itineraries = {} } = data
  const [editingFamily, setEditingFamily] = useState(null)
  const [familyName, setFamilyName] = useState('')
  const [familyEmoji, setFamilyEmoji] = useState('')
  const [importTab, setImportTab] = useState('paste') // 'paste' or 'sheets'
  const [importFamily, setImportFamily] = useState('family1')
  const [sheetUrl, setSheetUrl] = useState('')
  const [pasteText, setPasteText] = useState('')
  const { fetchSheet, loading: sheetsLoading, error: sheetsError } = useGoogleSheets()
  const [importStatus, setImportStatus] = useState(null)
  const [previousItinerary, setPreviousItinerary] = useState(null) // for undo
  const [parsing, setParsing] = useState(false)

  const handleFamilySave = (familyId) => {
    if (!familyName.trim()) return
    const updated = families.map(f =>
      f.id === familyId ? { ...f, name: familyName.trim(), emoji: familyEmoji || f.emoji } : f
    )
    onUpdateFamilies(updated)
    setEditingFamily(null)
  }

  const handleSheetsImport = async () => {
    if (!sheetUrl.trim()) return
    setImportStatus(null)
    const oldItems = itineraries[importFamily] || []
    const result = await fetchSheet(sheetUrl)
    if (result) {
      setPreviousItinerary({ familyId: importFamily, items: oldItems })
      onUpdateItinerary(importFamily, result)
      onUpdateSheetsConfig(importFamily, { url: sheetUrl, lastSync: new Date().toISOString() })
      const familyName = families.find(f => f.id === importFamily)?.name || importFamily
      setImportStatus({ type: 'success', message: `Imported ${result.length} activities for ${familyName} (replaced ${oldItems.length} previous).` })
    }
  }

  const handleRefreshSheet = async (familyId) => {
    const config = sheetsConfig[familyId]
    if (!config?.url) return
    setImportStatus(null)
    const result = await fetchSheet(config.url)
    if (result) {
      onUpdateItinerary(familyId, result)
      onUpdateSheetsConfig(familyId, { ...config, lastSync: new Date().toISOString() })
      setImportStatus({ type: 'success', message: `Refreshed ${result.length} activities for ${families.find(f => f.id === familyId)?.name}!` })
    }
  }

  const handlePasteImport = async () => {
    if (!pasteText.trim()) return
    setParsing(true)
    setImportStatus(null)

    try {
      const res = await fetch('/api/parse-itinerary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: pasteText }),
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Request failed' }))
        throw new Error(err.error || `Error ${res.status}`)
      }

      const { items } = await res.json()

      if (!items || items.length === 0) {
        setImportStatus({ type: 'error', message: 'Could not parse any activities from the text.' })
        setParsing(false)
        return
      }

      const oldItems = itineraries[importFamily] || []
      setPreviousItinerary({ familyId: importFamily, items: oldItems })

      // Only replace activities for dates referenced in the import, keep all other dates
      const importedDates = new Set(items.map(i => i.date).filter(Boolean))
      const kept = oldItems.filter(i => !importedDates.has(i.date))
      const merged = [...kept, ...items]

      onUpdateItinerary(importFamily, merged)
      const fName = families.find(f => f.id === importFamily)?.name || importFamily
      const dateList = [...importedDates].sort().join(', ')
      setImportStatus({ type: 'success', message: `Updated ${importedDates.size} day(s) for ${fName}: ${dateList}. ${kept.length} activities on other dates kept.` })
      setPasteText('')
    } catch (err) {
      setImportStatus({ type: 'error', message: `Failed to parse: ${err.message}` })
    } finally {
      setParsing(false)
    }
  }

  return (
    <div className="p-4 space-y-6">
      {/* Family Names & Emojis */}
      <section>
        <h2 className="text-lg font-bold text-gray-900 mb-3">Edit Families</h2>
        <div className="space-y-2">
          {families.map(f => {
            const colors = FAMILY_COLORS[f.id]
            return (
              <div key={f.id}>
                <div className="flex items-center gap-2">
                  <span className={`w-3 h-3 rounded-full ${colors.bg}`} />
                  {editingFamily === f.id ? (
                    <div className="flex-1 space-y-2">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={familyEmoji}
                          onChange={(e) => setFamilyEmoji(e.target.value)}
                          className="w-12 px-2 py-1 border rounded text-sm text-center"
                          placeholder="emoji"
                        />
                        <input
                          type="text"
                          value={familyName}
                          onChange={(e) => setFamilyName(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleFamilySave(f.id)}
                          className="flex-1 px-2 py-1 border rounded text-sm"
                          placeholder="Family name"
                          autoFocus
                        />
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => handleFamilySave(f.id)} className="text-green-600 text-sm font-medium">Save</button>
                        <button onClick={() => setEditingFamily(null)} className="text-gray-400 text-sm">Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex-1 flex items-center justify-between">
                      <span className="text-sm text-gray-700">{f.emoji} {f.name}</span>
                      <button
                        onClick={() => { setEditingFamily(f.id); setFamilyName(f.name); setFamilyEmoji(f.emoji) }}
                        className="text-xs text-blue-500"
                      >Edit</button>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* Trip Dates */}
      <section>
        <h2 className="text-lg font-bold text-gray-900 mb-3">Trip Dates</h2>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Start Date</label>
            <input
              type="date"
              value={tripDates.start || ''}
              onChange={(e) => onUpdateTripDates({ ...tripDates, start: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg text-sm"
            />
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">End Date</label>
            <input
              type="date"
              value={tripDates.end || ''}
              onChange={(e) => onUpdateTripDates({ ...tripDates, end: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg text-sm"
            />
          </div>
        </div>
      </section>

      {/* Update Itinerary */}
      <section>
        <h2 className="text-lg font-bold text-gray-900 mb-3">Update Itinerary</h2>

        {/* Family selector for import */}
        <div className="mb-3">
          <label className="text-xs text-gray-500 mb-1 block">Update for:</label>
          <select
            value={importFamily}
            onChange={(e) => setImportFamily(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg text-sm"
          >
            {families.map(f => (
              <option key={f.id} value={f.id}>{f.emoji} {f.name}</option>
            ))}
          </select>
        </div>

        {/* Import method tabs */}
        <div className="flex rounded-lg bg-gray-100 p-1 mb-3">
          <button
            onClick={() => setImportTab('paste')}
            className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${
              importTab === 'paste' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500'
            }`}
          >
            Paste Text from Apple Notes
          </button>
          <button
            onClick={() => setImportTab('sheets')}
            className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${
              importTab === 'sheets' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500'
            }`}
          >
            Google Sheets
          </button>
        </div>

        {importTab === 'paste' ? (
          <div className="space-y-3">
            <p className="text-xs text-gray-500">
              Paste your itinerary in any format. AI will parse it automatically.
            </p>
            <textarea
              value={pasteText}
              onChange={(e) => setPasteText(e.target.value)}
              placeholder={`Paste your itinerary here...\n\nDAY 1 — April 6\n* Flight: OZ 712, TPE → ICN\n* Check into Airbnb\n* Dinner at restaurant\n\nDAY 2 — April 7\n* 9:00 AM: Starfield Library\n* 10:00 AM: COEX Aquarium`}
              rows={6}
              className="w-full px-3 py-2 border rounded-lg text-sm font-mono resize-none"
            />
            <button
              onClick={handlePasteImport}
              disabled={!pasteText.trim() || parsing}
              className="w-full py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium disabled:opacity-50 hover:bg-blue-700"
            >
              {parsing ? 'Parsing with AI...' : 'Import from Text'}
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-xs text-gray-500">
              Paste a Google Sheets URL. The sheet must be published to web:<br />
              File &gt; Share &gt; Publish to web &gt; select CSV &gt; Publish
            </p>
            <p className="text-xs text-gray-500">
              Expected columns: <strong>date, time, activity, location</strong> (optional: notes, lat, lng)
            </p>
            <input
              type="url"
              value={sheetUrl}
              onChange={(e) => setSheetUrl(e.target.value)}
              placeholder="https://docs.google.com/spreadsheets/d/..."
              className="w-full px-3 py-2 border rounded-lg text-sm"
            />
            <button
              onClick={handleSheetsImport}
              disabled={sheetsLoading || !sheetUrl.trim()}
              className="w-full py-2.5 bg-green-600 text-white rounded-lg text-sm font-medium disabled:opacity-50 hover:bg-green-700"
            >
              {sheetsLoading ? 'Importing...' : 'Import from Google Sheets'}
            </button>
          </div>
        )}

        {/* Status messages + undo */}
        {importStatus && (
          <div className={`mt-3 p-3 rounded-lg text-sm ${
            importStatus.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
          }`}>
            <p>{importStatus.message}</p>
            {importStatus.type === 'success' && previousItinerary && (
              <button
                onClick={() => {
                  onUpdateItinerary(previousItinerary.familyId, previousItinerary.items)
                  setPreviousItinerary(null)
                  setImportStatus({ type: 'success', message: 'Import undone. Previous schedule restored.' })
                }}
                className="mt-2 px-3 py-1.5 bg-white text-green-700 rounded-lg text-xs font-medium border border-green-300 hover:bg-green-50"
              >
                Undo Import
              </button>
            )}
          </div>
        )}
        {sheetsError && (
          <div className="mt-3 p-3 rounded-lg text-sm bg-red-50 text-red-700">
            {sheetsError}
          </div>
        )}
      </section>

      {/* Connected Sheets */}
      {Object.keys(sheetsConfig).length > 0 && (
        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-3">Connected Sheets</h2>
          <div className="space-y-2">
            {Object.entries(sheetsConfig).map(([familyId, config]) => {
              const family = families.find(f => f.id === familyId)
              if (!family || !config?.url) return null
              const colors = FAMILY_COLORS[familyId]
              const itemCount = (itineraries[familyId] || []).length
              return (
                <div key={familyId} className={`p-3 rounded-lg border ${colors.border} ${colors.bgLight}`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-sm font-medium">{family.emoji} {family.name}</span>
                      <p className="text-xs text-gray-500">{itemCount} activities loaded</p>
                      {config.lastSync && (
                        <p className="text-xs text-gray-400">
                          Last synced: {new Date(config.lastSync).toLocaleString()}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => handleRefreshSheet(familyId)}
                      disabled={sheetsLoading}
                      className="px-3 py-1.5 bg-white rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 border"
                    >
                      {sheetsLoading ? '...' : 'Refresh'}
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      )}

      {/* Firebase Status */}
      <section>
        <h2 className="text-lg font-bold text-gray-900 mb-3">Sync Status</h2>
        <div className={`p-3 rounded-lg ${data.connected ? 'bg-green-50' : 'bg-yellow-50'}`}>
          <div className="flex items-center gap-2">
            <div className={`w-2.5 h-2.5 rounded-full ${data.connected ? 'bg-green-500' : 'bg-yellow-500'}`} />
            <span className="text-sm font-medium">
              {data.connected ? 'Connected — syncing across all devices' : 'Offline mode — data stored locally'}
            </span>
          </div>
          {!data.connected && (
            <p className="text-xs text-gray-500 mt-2">
              To sync across families, set up Firebase. Create a .env file with your Firebase config.
              See the README for setup instructions.
            </p>
          )}
        </div>
      </section>

      <div className="h-4" />
    </div>
  )
}
