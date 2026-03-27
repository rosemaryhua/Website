import { useState, useRef, useEffect } from 'react'

function buildItineraryContext(data) {
  const { families = [], itineraries = {}, tripDates = {} } = data
  let context = `Trip dates: ${tripDates.start} to ${tripDates.end}\n\n`

  for (const family of families) {
    const items = itineraries[family.id] || []
    if (items.length === 0) continue
    context += `=== ${family.emoji} ${family.name} ===\n`
    for (const item of items) {
      const parts = [item.date, item.time, item.activity, item.location, item.notes].filter(Boolean)
      context += parts.join(' | ') + '\n'
    }
    context += '\n'
  }
  return context
}

export default function Chat({ data }) {
  const [messages, setMessages] = useState(() => {
    try {
      const stored = localStorage.getItem('conciergeChat')
      return stored ? JSON.parse(stored) : []
    } catch {
      return []
    }
  })
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const messagesEnd = useRef(null)

  useEffect(() => {
    messagesEnd.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages.length, loading])

  useEffect(() => {
    localStorage.setItem('conciergeChat', JSON.stringify(messages))
  }, [messages])

  const handleSend = async (e) => {
    e.preventDefault()
    if (!input.trim() || loading) return

    const userMsg = { role: 'user', content: input.trim() }
    const updated = [...messages, userMsg]
    setMessages(updated)
    setInput('')
    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: updated,
          itineraryContext: buildItineraryContext(data),
        }),
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Request failed' }))
        throw new Error(err.error || `Error ${res.status}`)
      }

      const { reply } = await res.json()
      setMessages([...updated, { role: 'assistant', content: reply }])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleClear = () => {
    setMessages([])
    localStorage.removeItem('conciergeChat')
  }

  const suggestions = [
    'When are all 4 families in Seoul at the same time?',
    'What are the best restaurants near our Seoul Airbnb?',
    'How do I get from Incheon Airport to Yeonhui-dong?',
    'What should we pack for Korea in April?',
    'Translate "Where is the nearest subway?" to Korean',
  ]

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-4 py-3 bg-white border-b border-gray-100 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center text-white text-sm">
            AI
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900">Trip Concierge</p>
            <p className="text-xs text-gray-400">Knows all 4 family itineraries</p>
          </div>
        </div>
        {messages.length > 0 && (
          <button
            onClick={handleClear}
            className="text-xs text-gray-400 hover:text-red-400 px-2 py-1"
          >
            Clear
          </button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && !loading && (
          <div className="text-center py-6">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center text-white text-2xl">
              AI
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">Trip Concierge</h3>
            <p className="text-sm text-gray-500 mb-6 max-w-xs mx-auto">
              I know all 4 family itineraries. Ask me about the schedule, restaurants, directions, translations, or travel tips!
            </p>
            <div className="space-y-2">
              {suggestions.map((s, i) => (
                <button
                  key={i}
                  onClick={() => setInput(s)}
                  className="block w-full text-left px-4 py-2.5 bg-gray-50 rounded-xl text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] ${msg.role === 'user' ? '' : 'flex gap-2'}`}>
              {msg.role === 'assistant' && (
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center text-white text-xs shrink-0 mt-1">
                  AI
                </div>
              )}
              <div className={`rounded-2xl px-4 py-2.5 ${
                msg.role === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-900'
              }`}>
                <div className="text-sm whitespace-pre-wrap">{msg.content}</div>
              </div>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="flex gap-2">
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center text-white text-xs shrink-0 mt-1">
                AI
              </div>
              <div className="bg-gray-100 rounded-2xl px-4 py-3">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 text-red-700 rounded-xl px-4 py-3 text-sm">
            {error.includes('ANTHROPIC_API_KEY')
              ? 'Concierge not configured yet. Add your ANTHROPIC_API_KEY to Vercel environment variables.'
              : `Error: ${error}`}
          </div>
        )}

        <div ref={messagesEnd} />
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="p-3 bg-white border-t border-gray-100 flex gap-2 shrink-0">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about the trip..."
          className="flex-1 px-4 py-2.5 bg-gray-100 rounded-full text-sm outline-none focus:ring-2 focus:ring-blue-300"
          disabled={loading}
        />
        <button
          type="submit"
          disabled={!input.trim() || loading}
          className="p-2.5 bg-blue-600 text-white rounded-full disabled:opacity-30 hover:bg-blue-700 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
        </button>
      </form>
    </div>
  )
}
