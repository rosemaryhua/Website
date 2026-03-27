import { useState, useMemo } from 'react'
import { format, parseISO, eachDayOfInterval, isValid } from 'date-fns'
import { FAMILY_COLORS } from '../utils/constants'

export default function DailySchedule({ data }) {
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

  return (
    <div className="flex flex-col h-full">
      {/* Day selector - horizontal scroll */}
      <div className="flex gap-2 p-3 overflow-x-auto shrink-0 bg-white border-b border-gray-100">
        {days.map((day, i) => (
          <button
            key={i}
            onClick={() => setSelectedDay(i)}
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

          return (
            <div key={family.id} className={`rounded-xl border-2 ${colors.border} overflow-hidden`}>
              <div className={`${colors.bg} text-white px-4 py-2 flex items-center gap-2`}>
                <span>{family.emoji}</span>
                <span className="font-semibold">{family.name}</span>
                <span className="ml-auto text-sm opacity-80">
                  {activities.length} {activities.length === 1 ? 'activity' : 'activities'}
                </span>
              </div>

              {activities.length === 0 ? (
                <div className="px-4 py-3 text-gray-400 text-sm italic">
                  No activities scheduled
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {activities.map((item, i) => (
                    <div key={i} className="px-4 py-3">
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
                              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
