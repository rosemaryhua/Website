import { useState, useRef, useEffect } from 'react'
import { format, parseISO } from 'date-fns'
import { FAMILY_COLORS } from '../utils/constants'

export default function Chat({ data, currentFamily, onSendMessage }) {
  const { chat = [], families = [] } = data
  const [message, setMessage] = useState('')
  const messagesEnd = useRef(null)

  useEffect(() => {
    messagesEnd.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chat.length])

  const handleSend = (e) => {
    e.preventDefault()
    if (!message.trim() || !currentFamily) return
    onSendMessage({
      text: message.trim(),
      familyId: currentFamily,
      sender: families.find(f => f.id === currentFamily)?.name || 'Unknown',
    })
    setMessage('')
  }

  const familyMap = Object.fromEntries(families.map(f => [f.id, f]))

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {chat.length === 0 && (
          <div className="text-center text-gray-400 py-12">
            <svg className="w-12 h-12 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <p>No messages yet. Start the conversation!</p>
          </div>
        )}
        {chat.map((msg) => {
          const isMe = msg.familyId === currentFamily
          const family = familyMap[msg.familyId]
          const colors = FAMILY_COLORS[msg.familyId] || FAMILY_COLORS.family1

          return (
            <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] ${isMe ? 'order-2' : ''}`}>
                {!isMe && (
                  <span className={`text-xs font-medium ${colors.text} ml-1`}>
                    {family?.emoji} {msg.sender}
                  </span>
                )}
                <div className={`rounded-2xl px-4 py-2 ${
                  isMe
                    ? `${colors.bg} text-white`
                    : 'bg-gray-100 text-gray-900'
                }`}>
                  <p className="text-sm">{msg.text}</p>
                </div>
                {msg.timestamp && (
                  <p className={`text-xs text-gray-400 mt-0.5 ${isMe ? 'text-right' : ''} mx-1`}>
                    {format(parseISO(msg.timestamp), 'h:mm a')}
                  </p>
                )}
              </div>
            </div>
          )
        })}
        <div ref={messagesEnd} />
      </div>

      {/* Input */}
      {!currentFamily ? (
        <div className="p-4 bg-yellow-50 border-t border-yellow-200 text-center text-yellow-700 text-sm">
          Select your family in Settings to send messages
        </div>
      ) : (
        <form onSubmit={handleSend} className="p-3 bg-white border-t border-gray-100 flex gap-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 px-4 py-2.5 bg-gray-100 rounded-full text-sm outline-none focus:ring-2 focus:ring-blue-300"
          />
          <button
            type="submit"
            disabled={!message.trim()}
            className="p-2.5 bg-blue-600 text-white rounded-full disabled:opacity-30 hover:bg-blue-700 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </form>
      )}
    </div>
  )
}
