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
  const [importTab, setImportTab] = useState('sheets') // 'sheets' or 'paste'
  const [importFamily, setImportFamily] = useState('family1')
  const [sheetUrl, setSheetUrl] = useState('')
  const [pasteText, setPasteText] = useState('')
  const { fetchSheet, loading: sheetsLoading, error: sheetsError } = useGoogleSheets()
  const [importStatus, setImportStatus] = useState(null)
  const [previousItinerary, setPreviousItinerary] = useState(null) // for undo

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

  const handlePasteImport = () => {
    if (!pasteText.trim()) return
    const lines = pasteText.trim().split('\n')
    const items = []
    let currentDate = ''

    // Month name to number mapping
    const months = { jan:'01',feb:'02',mar:'03',apr:'04',may:'05',jun:'06',jul:'07',aug:'08',sep:'09',oct:'10',nov:'11',dec:'12',
      january:'01',february:'02',march:'03',april:'04',june:'06',july:'07',august:'08',september:'09',october:'10',november:'11',december:'12' }

    const parseDate = (str) => {
      // "April 6" or "Apr 6" or "APR 6"
      const md = str.match(/(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\w*\s+(\d{1,2})/i)
      if (md) {
        const m = months[md[1].toLowerCase()]
        const d = md[2].padStart(2, '0')
        return `2026-${m}-${d}`
      }
      // "4/6" or "04/06"
      const sd = str.match(/(\d{1,2})\/(\d{1,2})/)
      if (sd) return `2026-${sd[1].padStart(2,'0')}-${sd[2].padStart(2,'0')}`
      return ''
    }

    for (const raw of lines) {
      const line = raw.trim()
      if (!line) continue

      // Skip pure section headers like "TAIPEI", "Seoul", "Accommodation:", URLs, separators
      if (/^[⸻—─\-=]+$/.test(line)) continue
      if (/^https?:\/\//.test(line)) continue
      if (/^(taipei|seoul|busan|gyeongju|accommodation|dates:|spas)/i.test(line)) continue

      // Detect day headers: "DAY 1 — March 30 Monday", "DAY 3 — April 1 Wednesday", etc.
      const dayHeader = line.match(/DAY\s+\d+\s*[—\-–]\s*(.+)/i) ||
        line.match(/^((?:mon|tue|wed|thu|fri|sat|sun)\w*)\s+((?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\w*\s+\d{1,2})/i) ||
        line.match(/^((?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\w*\s+\d{1,2})\s/i)
      if (dayHeader) {
        const dateStr = dayHeader[1] || dayHeader[0]
        const parsed = parseDate(dateStr)
        if (parsed) currentDate = parsed
        // Check if there's also an activity on this line after the date
        const afterDate = line.replace(/DAY\s+\d+\s*[—\-–]\s*/i, '').replace(/^(mon|tue|wed|thu|fri|sat|sun)\w*\s+(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\w*\s+\d{1,2}\s*/i, '').trim()
        if (!afterDate || /^(mon|tue|wed|thu|fri|sat|sun)/i.test(afterDate)) continue
      }

      // Pipe or tab separated: "date | time | activity | location"
      const parts = line.split(/[|\t]/).map(s => s.trim()).filter(Boolean)
      if (parts.length >= 3) {
        const d = parseDate(parts[0]) || currentDate
        items.push({ date: d, time: parts[1], activity: parts[2], location: parts[3] || '', notes: parts[4] || '' })
        continue
      }

      // Bullet point line: "* 10:00 Activity name" or "* Activity name"
      const bullet = line.replace(/^[*•\-]\s*/, '')
      if (bullet === line && !dayHeader) {
        // Not a bullet, not a day header — check if it's a time-prefixed line
        const timeLine = line.match(/^(\d{1,2}:\d{2})\s*[-:]\s*(.+)/)
        if (timeLine) {
          items.push({ date: currentDate, time: timeLine[1], activity: timeLine[2].trim(), location: '', notes: '' })
          continue
        }
        // Skip lines that don't look like activities (sub-items, notes, etc.)
        if (/^\s{4,}/.test(raw)) continue
        if (!line) continue
      }

      // Parse time from bullet: "10:00: Activity" or "10:00 - 11:00: Activity" or just "Activity"
      const timeActivity = bullet.match(/^(\d{1,2}:\d{2})(?:\s*[-–]\s*\d{1,2}:\d{2})?\s*[:]\s*(.+)/) ||
        bullet.match(/^(\d{1,2}:\d{2})(?:\s*[-–]\s*\d{1,2}:\d{2})?\s+(.+)/)
      if (timeActivity) {
        const activity = timeActivity[2].trim()
        if (activity) {
          items.push({ date: currentDate, time: timeActivity[1], activity, location: '', notes: '' })
        }
        continue
      }

      // Bullet with no time
      if (bullet && bullet !== line) {
        // Skip indented sub-items (notes under an activity)
        if (/^\s{4,}/.test(raw)) continue
        items.push({ date: currentDate, time: '', activity: bullet.trim(), location: '', notes: '' })
        continue
      }
    }

    if (items.length === 0) {
      setImportStatus({ type: 'error', message: 'Could not parse any activities from the text. Try using bullet points (* Activity name) with day headers (DAY 1 — April 6).' })
      return
    }

    const oldItems = itineraries[importFamily] || []
    setPreviousItinerary({ familyId: importFamily, items: oldItems })
    onUpdateItinerary(importFamily, items)
    const fName = families.find(f => f.id === importFamily)?.name || importFamily
    setImportStatus({ type: 'success', message: `Imported ${items.length} activities for ${fName} (replaced ${oldItems.length} previous).` })
    setPasteText('')
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

      {/* Import Itinerary */}
      <section>
        <h2 className="text-lg font-bold text-gray-900 mb-3">Import Itinerary</h2>

        {/* Family selector for import */}
        <div className="mb-3">
          <label className="text-xs text-gray-500 mb-1 block">Import for:</label>
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
            onClick={() => setImportTab('sheets')}
            className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${
              importTab === 'sheets' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500'
            }`}
          >
            Google Sheets
          </button>
          <button
            onClick={() => setImportTab('paste')}
            className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${
              importTab === 'paste' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500'
            }`}
          >
            Paste Text from Apple Notes
          </button>
        </div>

        {importTab === 'sheets' ? (
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
        ) : (
          <div className="space-y-3">
            <p className="text-xs text-gray-500">
              Paste your itinerary from Apple Notes. Use tab or pipe (|) to separate columns.<br />
              Format: <strong>date | time | activity | location</strong>
            </p>
            <textarea
              value={pasteText}
              onChange={(e) => setPasteText(e.target.value)}
              placeholder={`Example:\n3/15 | 9:00 AM | Breakfast at café | Main St\n3/15 | 11:00 AM | Beach day | Bondi Beach\n3/16 | 10:00 AM | Museum visit | National Museum`}
              rows={6}
              className="w-full px-3 py-2 border rounded-lg text-sm font-mono resize-none"
            />
            <button
              onClick={handlePasteImport}
              disabled={!pasteText.trim()}
              className="w-full py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium disabled:opacity-50 hover:bg-blue-700"
            >
              Import from Text
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
