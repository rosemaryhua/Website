import { useState, useEffect } from 'react'
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom'
import { useAppData } from './hooks/useAppData'
import DailySchedule from './components/DailySchedule'
import MapView from './components/MapView'
import Chat from './components/Chat'
import Voting from './components/Voting'
import Settings from './components/Settings'

const tabs = [
  { path: '/', label: 'Schedule', icon: CalendarIcon },
  { path: '/map', label: 'Map', icon: MapIcon },
  { path: '/chat', label: 'Chat', icon: ChatIcon },
  { path: '/vote', label: 'Vote', icon: VoteIcon },
  { path: '/settings', label: 'Settings', icon: SettingsIcon },
]

const TRIP_PASSWORD = 'korea2026'

function PasswordGate({ children }) {
  const [authenticated, setAuthenticated] = useState(() =>
    sessionStorage.getItem('tripAuth') === 'true'
  )
  const [input, setInput] = useState('')
  const [error, setError] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (input === TRIP_PASSWORD) {
      sessionStorage.setItem('tripAuth', 'true')
      setAuthenticated(true)
    } else {
      setError(true)
      setInput('')
    }
  }

  if (authenticated) return children

  return (
    <div className="h-full flex items-center justify-center bg-gradient-to-br from-blue-600 to-blue-900 p-6">
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-sm text-center">
        <div className="text-4xl mb-3">🇰🇷</div>
        <h1 className="text-xl font-bold text-gray-900 mb-1">Family Trip</h1>
        <p className="text-sm text-gray-500 mb-6">Enter the password to continue</p>
        <input
          type="password"
          value={input}
          onChange={(e) => { setInput(e.target.value); setError(false) }}
          placeholder="Password"
          className={`w-full px-4 py-3 rounded-xl border-2 text-center text-lg outline-none transition-colors ${
            error ? 'border-red-400 bg-red-50' : 'border-gray-200 focus:border-blue-400'
          }`}
          autoFocus
        />
        {error && <p className="text-red-500 text-sm mt-2">Wrong password, try again</p>}
        <button
          type="submit"
          className="w-full mt-4 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors"
        >
          Enter
        </button>
      </form>
    </div>
  )
}

export default function App() {
  const navigate = useNavigate()
  const location = useLocation()
  const {
    data, connected, isConfigured,
    updateFamilies, updateTripDates, updateItinerary,
    sendMessage, addVote, castVote, updateSheetsConfig, updateMapsConfig,
  } = useAppData()

  const [currentFamily, setCurrentFamily] = useState(() =>
    localStorage.getItem('currentFamily') || ''
  )

  const handleSetFamily = (familyId) => {
    setCurrentFamily(familyId)
    localStorage.setItem('currentFamily', familyId)
  }

  const enrichedData = { ...data, connected }
  const currentPath = location.pathname

  // Count unread messages for badge
  const chatCount = (data.chat || []).length

  return (
    <PasswordGate>
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 to-blue-800 text-white px-4 py-3 shrink-0 shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold tracking-tight">Korea 2026</h1>
            <p className="text-blue-200 text-xs">
              Hua, Ku, Kim, DeAragon Family Trip
            </p>
          </div>
          <div className="flex items-center gap-1.5">
            <div className={`w-2 h-2 rounded-full ${connected ? 'bg-green-400' : 'bg-yellow-400'}`} />
            <span className="text-xs text-blue-200">{connected ? 'Synced' : 'Local'}</span>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 overflow-y-auto flex flex-col">
        <Routes>
          <Route path="/" element={<DailySchedule data={enrichedData} onUpdateItinerary={updateItinerary} />} />
          <Route path="/map" element={<MapView data={enrichedData} onUpdateMapsConfig={updateMapsConfig} />} />
          <Route path="/chat" element={
            <Chat data={enrichedData} currentFamily={currentFamily} onSendMessage={sendMessage} />
          } />
          <Route path="/vote" element={
            <Voting data={enrichedData} currentFamily={currentFamily} onAddVote={addVote} onCastVote={castVote} />
          } />
          <Route path="/settings" element={
            <Settings
              data={enrichedData}
              currentFamily={currentFamily}
              onSetCurrentFamily={handleSetFamily}
              onUpdateFamilies={updateFamilies}
              onUpdateTripDates={updateTripDates}
              onUpdateItinerary={updateItinerary}
              onUpdateSheetsConfig={updateSheetsConfig}
            />
          } />
        </Routes>
      </main>

      {/* Bottom Tab Bar */}
      <nav className="bg-white border-t border-gray-200 shrink-0 pb-[env(safe-area-inset-bottom)]">
        <div className="flex justify-around">
          {tabs.map(tab => {
            const isActive = currentPath === tab.path
            const Icon = tab.icon
            return (
              <button
                key={tab.path}
                onClick={() => navigate(tab.path)}
                className={`flex flex-col items-center py-2 px-3 min-w-[56px] transition-colors relative ${
                  isActive ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                <Icon active={isActive} />
                <span className={`text-xs mt-0.5 ${isActive ? 'font-semibold' : ''}`}>
                  {tab.label}
                </span>
                {tab.label === 'Chat' && chatCount > 0 && !isActive && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
                )}
              </button>
            )
          })}
        </div>
      </nav>
    </div>
    </PasswordGate>
  )
}

// Tab bar icons
function CalendarIcon({ active }) {
  return (
    <svg className="w-6 h-6" fill={active ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={active ? 0 : 1.5}>
      {active ? (
        <path d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
      ) : (
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5m-9-6h.008v.008H12v-.008zM12 15h.008v.008H12V15zm0 2.25h.008v.008H12v-.008zM9.75 15h.008v.008H9.75V15zm0 2.25h.008v.008H9.75v-.008zM7.5 15h.008v.008H7.5V15zm0 2.25h.008v.008H7.5v-.008zm6.75-4.5h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V15zm0 2.25h.008v.008h-.008v-.008zm2.25-4.5h.008v.008H16.5v-.008zm0 2.25h.008v.008H16.5V15z" />
      )}
    </svg>
  )
}

function MapIcon({ active }) {
  return (
    <svg className="w-6 h-6" fill={active ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={active ? 0 : 1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m0 0l-3-3m3 3l3-3m6 3V6.75M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
    </svg>
  )
}

function ChatIcon({ active }) {
  return (
    <svg className="w-6 h-6" fill={active ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={active ? 0 : 1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
    </svg>
  )
}

function VoteIcon({ active }) {
  return (
    <svg className="w-6 h-6" fill={active ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={active ? 0 : 1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
    </svg>
  )
}

function SettingsIcon({ active }) {
  return (
    <svg className="w-6 h-6" fill={active ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={active ? 0 : 1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  )
}
