import { useState, useMemo } from 'react'
import { format, parseISO, eachDayOfInterval, isValid } from 'date-fns'
import { FAMILY_COLORS } from '../utils/constants'

function formatTime(time) {
  if (!time) return ''
  const match = time.match(/^(\d{1,2}):(\d{2})/)
  if (!match) return time
  let h = parseInt(match[1])
  const m = match[2]
  const ampm = h >= 12 ? 'PM' : 'AM'
  if (h === 0) h = 12
  else if (h > 12) h -= 12
  return `${h}:${m} ${ampm}`
}

function to12h(time24) {
  if (!time24) return { hour: '12', minute: '00', ampm: 'AM' }
  const match = time24.match(/^(\d{1,2}):(\d{2})/)
  if (!match) return { hour: '12', minute: '00', ampm: 'AM' }
  let h = parseInt(match[1])
  const m = match[2]
  const ampm = h >= 12 ? 'PM' : 'AM'
  if (h === 0) h = 12
  else if (h > 12) h -= 12
  return { hour: String(h), minute: m, ampm }
}

function to24h(hour, minute, ampm) {
  let h = parseInt(hour)
  if (ampm === 'AM' && h === 12) h = 0
  else if (ampm === 'PM' && h !== 12) h += 12
  return `${String(h).padStart(2, '0')}:${minute}`
}

function TimePickerFields({ hour, minute, ampm, onChange }) {
  return (
    <div className="flex gap-1 items-end">
      <div className="w-14">
        <label className="text-xs text-gray-500">Hour</label>
        <select value={hour} onChange={(e) => onChange({ hour: e.target.value, minute, ampm })}
          className="w-full px-1 py-1.5 border rounded text-sm bg-white">
          {[12,1,2,3,4,5,6,7,8,9,10,11].map(h => (
            <option key={h} value={String(h)}>{h}</option>
          ))}
        </select>
      </div>
      <div className="w-14">
        <label className="text-xs text-gray-500">Min</label>
        <select value={minute} onChange={(e) => onChange({ hour, minute: e.target.value, ampm })}
          className="w-full px-1 py-1.5 border rounded text-sm bg-white">
          {['00','05','10','15','20','25','30','35','40','45','50','55'].map(m => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>
      </div>
      <div className="w-16">
        <label className="text-xs text-gray-500">&nbsp;</label>
        <select value={ampm} onChange={(e) => onChange({ hour, minute, ampm: e.target.value })}
          className="w-full px-1 py-1.5 border rounded text-sm bg-white">
          <option value="AM">AM</option>
          <option value="PM">PM</option>
        </select>
      </div>
    </div>
  )
}

function ActivityItem({ item, familyId, colors, allItems, families, itineraries, onUpdateItinerary }) {
  const [editing, setEditing] = useState(false)
  const [joining, setJoining] = useState(false)
  const [form, setForm] = useState({})

  const startEdit = () => {
    const t = to12h(item.time)
    setForm({
      activity: item.activity || '',
      location: item.location || '',
      hour: t.hour,
      minute: t.minute,
      ampm: t.ampm,
      date: item.date || '',
      notes: item.notes || '',
    })
    setEditing(true)
  }

  const findItemIndex = () =>
    allItems.findIndex(a =>
      a.date === item.date && a.time === item.time && a.activity === item.activity && a.location === item.location
    )

  const handleSave = () => {
    const idx = findItemIndex()
    if (idx === -1) return
    const { hour, minute, ampm, ...rest } = form
    const time = to24h(hour, minute, ampm)
    const updated = [...allItems]
    updated[idx] = { ...updated[idx], ...rest, time }
    onUpdateItinerary(familyId, updated)
    setEditing(false)
  }

  const handleDelete = () => {
    const idx = findItemIndex()
    if (idx === -1) return
    const updated = allItems.filter((_, i) => i !== idx)
    onUpdateItinerary(familyId, updated)
    setEditing(false)
  }

  if (editing) {
    return (
      <div className="px-3 py-3 bg-gray-50 space-y-2">
        <div>
          <label className="text-xs text-gray-500">Activity</label>
          <input
            type="text"
            value={form.activity}
            onChange={(e) => setForm({ ...form, activity: e.target.value })}
            className="w-full px-2 py-1.5 border rounded text-sm bg-white"
          />
        </div>
        <div>
          <label className="text-xs text-gray-500">Location</label>
          <input
            type="text"
            value={form.location}
            onChange={(e) => setForm({ ...form, location: e.target.value })}
            placeholder="Optional"
            className="w-full px-2 py-1.5 border rounded text-sm bg-white"
          />
        </div>
        <div>
          <label className="text-xs text-gray-500">Date</label>
          <input
            type="date"
            value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
            className="w-full px-2 py-1.5 border rounded text-sm bg-white"
          />
        </div>
        <TimePickerFields
          hour={form.hour} minute={form.minute} ampm={form.ampm}
          onChange={({ hour, minute, ampm }) => setForm({ ...form, hour, minute, ampm })}
        />
        <div>
          <label className="text-xs text-gray-500">Notes</label>
          <input
            type="text"
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            placeholder="Optional"
            className="w-full px-2 py-1.5 border rounded text-sm bg-white"
          />
        </div>
        <div className="flex items-center gap-2 pt-1">
          <button
            onClick={handleSave}
            className="px-4 py-1.5 bg-green-600 text-white rounded-lg text-sm font-medium"
          >
            Confirm
          </button>
          <button
            onClick={() => setEditing(false)}
            className="px-4 py-1.5 bg-gray-200 text-gray-700 rounded-lg text-sm"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            className="ml-auto text-xs text-red-400 hover:text-red-600"
          >
            Delete
          </button>
        </div>
      </div>
    )
  }

  const otherFamilies = families.filter(f => f.id !== familyId)

  const handleJoin = (targetFamilyId) => {
    const theirItems = itineraries[targetFamilyId] || []
    const newItem = { date: item.date, time: item.time, activity: item.activity, location: item.location || '', notes: item.notes || '' }
    onUpdateItinerary(targetFamilyId, [...theirItems, newItem])
    setJoining(false)
  }

  if (joining) {
    return (
      <div className="px-4 py-3 bg-purple-50 space-y-2">
        <p className="text-sm font-medium text-gray-900">
          Join "{item.activity}" — which family?
        </p>
        <div className="flex flex-wrap gap-2">
          {otherFamilies.map(f => {
            const fc = FAMILY_COLORS[f.id]
            return (
              <button
                key={f.id}
                onClick={() => handleJoin(f.id)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium ${fc.bg} text-white hover:opacity-90`}
              >
                {f.emoji} {f.name}
              </button>
            )
          })}
        </div>
        <button
          onClick={() => setJoining(false)}
          className="text-xs text-gray-400 hover:text-gray-600"
        >
          Cancel
        </button>
      </div>
    )
  }

  return (
    <div className="px-4 py-3">
      <div className="flex items-start gap-3">
        {item.time && (
          <span className={`text-sm font-mono font-semibold ${colors.text} min-w-[70px]`}>
            {formatTime(item.time)}
          </span>
        )}
        <div className="flex-1 min-w-0">
          <p className="font-medium text-gray-900">{item.activity}</p>
          {item.location && (
            <p className="text-sm text-gray-500 flex items-center gap-1 mt-0.5">
              <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {item.location}
            </p>
          )}
          {item.notes && (
            <p className="text-sm text-gray-400 mt-1">{item.notes}</p>
          )}
        </div>
        <div className="flex gap-1 shrink-0 mt-1">
          <button
            onClick={(e) => { e.stopPropagation(); setJoining(true) }}
            className="p-1 text-gray-300 hover:text-purple-500"
            title="Join this activity"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          </button>
          <button
            onClick={startEdit}
            className="p-1 text-gray-300 hover:text-gray-500"
            title="Edit"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}

function AddActivityForm({ familyId, families, itineraries, dayStr, onUpdateItinerary, allItems, onClose }) {
  const [form, setForm] = useState({
    activity: '',
    location: '',
    hour: '12',
    minute: '00',
    ampm: 'AM',
    date: dayStr,
    notes: '',
  })
  const [alsoAdd, setAlsoAdd] = useState({})

  const otherFamilies = families.filter(f => f.id !== familyId)

  const toggleFamily = (fId) => {
    setAlsoAdd(prev => ({ ...prev, [fId]: !prev[fId] }))
  }

  const handleAdd = () => {
    if (!form.activity.trim()) return
    const { hour, minute, ampm, ...rest } = form
    const time = to24h(hour, minute, ampm)
    const newItem = { ...rest, time, activity: form.activity.trim() }

    // Add to primary family
    onUpdateItinerary(familyId, [...allItems, newItem])

    // Add to selected other families
    for (const f of otherFamilies) {
      if (alsoAdd[f.id]) {
        const theirItems = itineraries[f.id] || []
        onUpdateItinerary(f.id, [...theirItems, newItem])
      }
    }

    onClose()
  }

  return (
    <div className="px-3 py-3 bg-blue-50 space-y-2 border-t border-blue-100">
      <div>
        <label className="text-xs text-gray-500">Activity</label>
        <input
          type="text"
          value={form.activity}
          onChange={(e) => setForm({ ...form, activity: e.target.value })}
          placeholder="What's the plan?"
          className="w-full px-2 py-1.5 border rounded text-sm bg-white"
          autoFocus
        />
      </div>
      <div>
        <label className="text-xs text-gray-500">Location</label>
        <input
          type="text"
          value={form.location}
          onChange={(e) => setForm({ ...form, location: e.target.value })}
          placeholder="Optional"
          className="w-full px-2 py-1.5 border rounded text-sm bg-white"
        />
      </div>
      <div>
        <label className="text-xs text-gray-500">Date</label>
        <input
          type="date"
          value={form.date}
          onChange={(e) => setForm({ ...form, date: e.target.value })}
          className="w-full px-2 py-1.5 border rounded text-sm bg-white"
        />
      </div>
      <TimePickerFields
        hour={form.hour} minute={form.minute} ampm={form.ampm}
        onChange={({ hour, minute, ampm }) => setForm({ ...form, hour, minute, ampm })}
      />
      <div>
        <label className="text-xs text-gray-500">Notes</label>
        <input
          type="text"
          value={form.notes}
          onChange={(e) => setForm({ ...form, notes: e.target.value })}
          placeholder="Optional"
          className="w-full px-2 py-1.5 border rounded text-sm bg-white"
        />
      </div>
      {/* Also add to other families */}
      <div>
        <label className="text-xs text-gray-500 mb-1 block">Also add to:</label>
        <div className="flex flex-wrap gap-2">
          {otherFamilies.map(f => {
            const colors = FAMILY_COLORS[f.id]
            const selected = alsoAdd[f.id]
            return (
              <button
                key={f.id}
                type="button"
                onClick={() => toggleFamily(f.id)}
                className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all ${
                  selected ? `${colors.bg} text-white` : `${colors.bgLight} ${colors.text}`
                }`}
              >
                {f.emoji} {f.name}
              </button>
            )
          })}
        </div>
      </div>

      <div className="flex gap-2 pt-1">
        <button
          onClick={handleAdd}
          disabled={!form.activity.trim()}
          className="px-4 py-1.5 bg-blue-600 text-white rounded-lg text-sm font-medium disabled:opacity-50"
        >
          Add
        </button>
        <button
          onClick={onClose}
          className="px-4 py-1.5 bg-gray-200 text-gray-700 rounded-lg text-sm"
        >
          Cancel
        </button>
      </div>
    </div>
  )
}

export default function DailySchedule({ data, onUpdateItinerary }) {
  const { families = [], itineraries = {}, tripDates = {} } = data

  const days = useMemo(() => {
    try {
      const start = parseISO(tripDates.start)
      const end = parseISO(tripDates.end)
      if (!isValid(start) || !isValid(end)) return []
      return eachDayOfInterval({ start, end })
    } catch {
      return []
    }
  }, [tripDates])

  const [selectedDay, setSelectedDay] = useState(0)
  const [addingFor, setAddingFor] = useState(null) // familyId or null
  const currentDay = days[selectedDay]

  const activitiesForDay = useMemo(() => {
    if (!currentDay) return {}
    const dayStr = format(currentDay, 'yyyy-MM-dd')
    const dayAlt = format(currentDay, 'M/d')
    const dayAlt2 = format(currentDay, 'MM/dd')
    const dayName = format(currentDay, 'EEEE').toLowerCase()

    const result = {}
    for (const family of families) {
      const items = itineraries[family.id] || []
      result[family.id] = items.filter(item => {
        const d = (item.date || '').toLowerCase().trim()
        return d === dayStr || d === dayAlt || d === dayAlt2 ||
          d.includes(dayName) || d.includes(format(currentDay, 'MMM d').toLowerCase()) ||
          d === `day ${selectedDay + 1}`
      }).sort((a, b) => (a.time || '').localeCompare(b.time || ''))
    }
    return result
  }, [currentDay, families, itineraries, selectedDay])

  if (days.length === 0) {
    return (
      <div className="p-6 text-center text-gray-500">
        <p className="text-lg mb-2">No trip dates set</p>
        <p>Go to Settings to set your trip dates and import itineraries.</p>
      </div>
    )
  }

  const dayStr = currentDay ? format(currentDay, 'yyyy-MM-dd') : ''

  return (
    <div className="flex flex-col h-full">
      {/* Day selector - horizontal scroll */}
      <div className="flex gap-2 p-3 overflow-x-auto shrink-0 bg-white border-b border-gray-100">
        {days.map((day, i) => (
          <button
            key={i}
            onClick={() => { setSelectedDay(i); setAddingFor(null) }}
            className={`flex flex-col items-center px-3 py-2 rounded-xl min-w-[60px] transition-all ${
              i === selectedDay
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
            }`}
          >
            <span className="text-xs font-medium">{format(day, 'EEE')}</span>
            <span className="text-lg font-bold">{format(day, 'd')}</span>
            <span className="text-xs">{format(day, 'MMM')}</span>
          </button>
        ))}
      </div>

      {/* Day header */}
      <div className="px-4 py-3 bg-white border-b border-gray-100">
        <h2 className="text-xl font-bold text-gray-900">
          {currentDay && format(currentDay, 'EEEE, MMMM d')}
        </h2>
      </div>

      {/* Family schedules */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {families.map(family => {
          const colors = FAMILY_COLORS[family.id]
          const activities = activitiesForDay[family.id] || []
          const allItems = itineraries[family.id] || []

          return (
            <div key={family.id} className={`rounded-xl border-2 ${colors.border} overflow-hidden`}>
              <div className={`${colors.bg} text-white px-4 py-2 flex items-center gap-2`}>
                <span>{family.emoji}</span>
                <span className="font-semibold">{family.name}</span>
                <span className="ml-auto text-sm opacity-80">
                  {activities.length} {activities.length === 1 ? 'activity' : 'activities'}
                </span>
              </div>

              {activities.length === 0 && addingFor !== family.id && (
                <div className="px-4 py-3 text-gray-400 text-sm italic">
                  No activities scheduled
                </div>
              )}

              {activities.length > 0 && (
                <div className="divide-y divide-gray-100">
                  {activities.map((item, i) => (
                    <ActivityItem
                      key={`${item.date}-${item.time}-${i}`}
                      item={item}
                      familyId={family.id}
                      colors={colors}
                      allItems={allItems}
                      families={families}
                      itineraries={itineraries}
                      onUpdateItinerary={onUpdateItinerary}
                    />
                  ))}
                </div>
              )}

              {/* Add activity form or button */}
              {addingFor === family.id ? (
                <AddActivityForm
                  familyId={family.id}
                  families={families}
                  itineraries={itineraries}
                  dayStr={dayStr}
                  allItems={allItems}
                  onUpdateItinerary={onUpdateItinerary}
                  onClose={() => setAddingFor(null)}
                />
              ) : (
                <button
                  onClick={() => setAddingFor(family.id)}
                  className={`w-full px-4 py-2 text-sm ${colors.text} hover:bg-gray-50 transition-colors border-t border-gray-100`}
                >
                  + Add activity
                </button>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
