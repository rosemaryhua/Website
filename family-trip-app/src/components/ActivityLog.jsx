import { format, parseISO } from 'date-fns'
import { FAMILY_COLORS } from '../utils/constants'

export default function ActivityLog({ data }) {
  const { activityLog = [], families = [] } = data
  const familyMap = Object.fromEntries(families.map(f => [f.id, f]))

  const sorted = [...activityLog].reverse()

  const typeLabel = {
    added: 'Added',
    deleted: 'Deleted',
    edited: 'Edited',
  }

  const typeColor = {
    added: 'text-green-600 bg-green-50',
    deleted: 'text-red-500 bg-red-50',
    edited: 'text-blue-600 bg-blue-50',
  }

  const typeIcon = {
    added: '+',
    deleted: '−',
    edited: '~',
  }

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-3 bg-white border-b border-gray-100 shrink-0">
        <h2 className="text-lg font-bold text-gray-900">Activity Log</h2>
        <p className="text-xs text-gray-400">Recent changes to itineraries</p>
      </div>

      <div className="flex-1 overflow-y-auto">
        {sorted.length === 0 ? (
          <div className="text-center text-gray-400 py-12">
            <svg className="w-12 h-12 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p>No changes yet</p>
            <p className="text-xs mt-1">Edits, additions, and deletions will show up here</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {sorted.map((entry) => {
              const family = familyMap[entry.familyId]
              const colors = FAMILY_COLORS[entry.familyId] || FAMILY_COLORS.family1
              let timeAgo = ''
              try {
                const diff = Date.now() - new Date(entry.timestamp).getTime()
                if (diff < 60000) timeAgo = 'Just now'
                else if (diff < 3600000) timeAgo = `${Math.floor(diff / 60000)}m ago`
                else if (diff < 86400000) timeAgo = `${Math.floor(diff / 3600000)}h ago`
                else timeAgo = format(parseISO(entry.timestamp), 'MMM d, h:mm a')
              } catch {
                timeAgo = ''
              }

              return (
                <div key={entry.id} className="px-4 py-3 flex gap-3">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${typeColor[entry.type]}`}>
                    {typeIcon[entry.type]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-xs px-1.5 py-0.5 rounded ${typeColor[entry.type]} font-medium`}>
                        {typeLabel[entry.type]}
                      </span>
                      {family && (
                        <span className={`text-xs px-1.5 py-0.5 rounded ${colors.bgLight} ${colors.text} font-medium`}>
                          {family.emoji} {family.name}
                        </span>
                      )}
                    </div>
                    <p className="text-sm font-medium text-gray-900 mt-1 truncate">
                      {entry.type === 'edited' && entry.oldActivity !== entry.activity
                        ? `"${entry.oldActivity}" → "${entry.activity}"`
                        : entry.activity
                      }
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      {entry.date && (
                        <span className="text-xs text-gray-400">{entry.date}</span>
                      )}
                      {entry.time && (
                        <span className="text-xs text-gray-400">{entry.time}</span>
                      )}
                      <span className="text-xs text-gray-300 ml-auto">{timeAgo}</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
