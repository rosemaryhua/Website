import { useState, useMemo } from 'react'
import { format, parseISO, eachDayOfInterval, isValid } from 'date-fns'
import { FAMILY_COLORS } from '../utils/constants'

function ActivityItem({ item, familyId, colors, allItems, onUpdateItinerary }) {
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({})

  const startEdit = () => {
    setForm({
      activity: item.activity || '',
      location: item.location || '',
      time: item.time || '',
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
    const updated = [...allItems]
    updated[idx] = { ...updated[idx], ...form }
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
        <div className="flex gap-2">
          <div className="flex-1">
            <label className="text-xs text-gray-500">Date</label>
            <input
              type="date"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              className="w-full px-2 py-1.5 border rounded text-sm bg-white"
            />
          </div>
          <div className="w-24">
            <label className="text-xs text-gray-500">Time</label>
            <input
              type="text"
              value={form.time}
              onChange={(e) => setForm({ ...form, time: e.target.value })}
              placeholder="09:00"
              className="w-full px-2 py-1.5 border rounded text-sm bg-white"
            />
          </div>
        </div>
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

  return (
    <div className="px-4 py-3 group" onClick={startEdit}>
      <div className="flex items-start gap-3">
        {item.time && (
          <span className={`text-sm font-mono font-semibold ${colors.text} min-w-[55px]`}>
            {item.time}
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
        <svg className="w-4 h-4 text-gray-300 shrink-0 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
        </svg>
      </div>
    </div>
  )
}

function AddActivityForm({ familyId, families, itineraries, dayStr, onUpdateItinerary, allItems, onClose }) {
  const [form, setForm] = useState({
    activity: '',
    location: '',
    time: '',
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
    const newItem = { ...form, activity: form.activity.trim() }

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
      <div className="flex gap-2">
        <div className="flex-1">
          <label className="text-xs text-gray-500">Date</label>
          <input
            type="date"
            value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
            className="w-full px-2 py-1.5 border rounded text-sm bg-white"
          />
        </div>
        <div className="w-24">
          <label className="text-xs text-gray-500">Time</label>
          <input
            type="text"
            value={form.time}
            onChange={(e) => setForm({ ...form, time: e.target.value })}
            placeholder="09:00"
            className="w-full px-2 py-1.5 border rounded text-sm bg-white"
          />
        </div>
      </div>
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
