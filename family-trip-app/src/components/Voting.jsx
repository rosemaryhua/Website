import { useState } from 'react'
import { format, parseISO } from 'date-fns'
import { FAMILY_COLORS } from '../utils/constants'

export default function Voting({ data, onAddVote, onEditVote, onDeleteVote, onCastVote }) {
  const { votes = [], families = [] } = data
  const [showNew, setShowNew] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [proposerFamily, setProposerFamily] = useState('family1')
  const [voteAsFamily, setVoteAsFamily] = useState('family1')
  const [editingId, setEditingId] = useState(null)
  const [editTitle, setEditTitle] = useState('')
  const [editDescription, setEditDescription] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!title.trim()) return
    onAddVote({
      title: title.trim(),
      description: description.trim(),
      proposedBy: proposerFamily,
    })
    setTitle('')
    setDescription('')
    setShowNew(false)
  }

  const handleStartEdit = (proposal) => {
    setEditingId(proposal.id)
    setEditTitle(proposal.title)
    setEditDescription(proposal.description || '')
  }

  const handleSaveEdit = (proposalId) => {
    if (!editTitle.trim()) return
    onEditVote(proposalId, { title: editTitle.trim(), description: editDescription.trim() })
    setEditingId(null)
  }

  const handleDelete = (proposalId) => {
    onDeleteVote(proposalId)
  }

  const sortedVotes = [...votes].reverse()

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* New proposal button */}
        {!showNew && (
          <button
            onClick={() => setShowNew(true)}
            className="w-full py-3 border-2 border-dashed border-blue-300 rounded-xl text-blue-600 font-medium hover:bg-blue-50 transition-colors"
          >
            + Propose an Activity
          </button>
        )}

        {/* New proposal form */}
        {showNew && (
          <form onSubmit={handleSubmit} className="bg-blue-50 rounded-xl p-4 space-y-3">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Family</label>
              <select
                value={proposerFamily}
                onChange={(e) => setProposerFamily(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-blue-200 text-sm outline-none focus:ring-2 focus:ring-blue-300 bg-white"
              >
                {families.map(f => (
                  <option key={f.id} value={f.id}>{f.emoji} {f.name}</option>
                ))}
              </select>
            </div>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Activity name (e.g., Beach day at Haeundae)"
              className="w-full px-3 py-2 rounded-lg border border-blue-200 text-sm outline-none focus:ring-2 focus:ring-blue-300 bg-white"
              autoFocus
            />
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Details (optional) — when, where, what to bring..."
              rows={2}
              className="w-full px-3 py-2 rounded-lg border border-blue-200 text-sm outline-none focus:ring-2 focus:ring-blue-300 resize-none bg-white"
            />
            <div className="flex gap-2">
              <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium">
                Propose
              </button>
              <button type="button" onClick={() => setShowNew(false)} className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm">
                Cancel
              </button>
            </div>
          </form>
        )}

        {/* Vote cards */}
        {sortedVotes.length === 0 && !showNew && (
          <div className="text-center text-gray-400 py-12">
            <svg className="w-12 h-12 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
            <p>No activity proposals yet</p>
          </div>
        )}

        {sortedVotes.map(proposal => {
          const proposer = families.find(f => f.id === proposal.proposedBy)
          const yesVotes = Object.entries(proposal.votes || {}).filter(([, v]) => v === 'yes')
          const noVotes = Object.entries(proposal.votes || {}).filter(([, v]) => v === 'no')
          const myVote = (proposal.votes || {})[voteAsFamily] || null
          const isEditing = editingId === proposal.id

          return (
            <div key={proposal.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
              <div className="p-4">
                {isEditing ? (
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border text-sm outline-none focus:ring-2 focus:ring-blue-300 bg-white"
                      autoFocus
                    />
                    <textarea
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                      placeholder="Details (optional)"
                      rows={2}
                      className="w-full px-3 py-2 rounded-lg border text-sm outline-none focus:ring-2 focus:ring-blue-300 resize-none bg-white"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleSaveEdit(proposal.id)}
                        className="px-4 py-1.5 bg-green-600 text-white rounded-lg text-sm font-medium"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="px-4 py-1.5 bg-gray-200 text-gray-700 rounded-lg text-sm"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{proposal.title}</h3>
                        {proposal.description && (
                          <p className="text-sm text-gray-500 mt-1">{proposal.description}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        {proposer && (
                          <span className={`text-xs px-2 py-1 rounded-full ${FAMILY_COLORS[proposer.id].bgLight} ${FAMILY_COLORS[proposer.id].text} whitespace-nowrap`}>
                            {proposer.emoji} {proposer.name}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Edit / Delete buttons */}
                    <div className="mt-2 flex gap-3">
                      <button
                        onClick={() => handleStartEdit(proposal)}
                        className="text-xs text-blue-500 hover:text-blue-700"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(proposal.id)}
                        className="text-xs text-red-400 hover:text-red-600"
                      >
                        Delete
                      </button>
                    </div>

                    {/* Vote results */}
                    <div className="mt-3 flex gap-4">
                      <div className="flex items-center gap-1">
                        <span className="text-green-500 text-lg">👍</span>
                        <span className="text-sm font-medium text-gray-700">{yesVotes.length}</span>
                        <div className="flex -space-x-1 ml-1">
                          {yesVotes.map(([fId]) => {
                            const f = families.find(fam => fam.id === fId)
                            return f ? (
                              <span key={fId} className="text-xs" title={f.name}>{f.emoji}</span>
                            ) : null
                          })}
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-red-400 text-lg">👎</span>
                        <span className="text-sm font-medium text-gray-700">{noVotes.length}</span>
                        <div className="flex -space-x-1 ml-1">
                          {noVotes.map(([fId]) => {
                            const f = families.find(fam => fam.id === fId)
                            return f ? (
                              <span key={fId} className="text-xs" title={f.name}>{f.emoji}</span>
                            ) : null
                          })}
                        </div>
                      </div>
                    </div>

                    {/* Vote as family selector + buttons */}
                    <div className="mt-3 space-y-2">
                      <select
                        value={voteAsFamily}
                        onChange={(e) => setVoteAsFamily(e.target.value)}
                        className="w-full px-2 py-1.5 border rounded-lg text-xs text-gray-600 bg-white"
                      >
                        {families.map(f => (
                          <option key={f.id} value={f.id}>Vote as {f.emoji} {f.name}</option>
                        ))}
                      </select>
                      <div className="flex gap-2">
                        <button
                          onClick={() => onCastVote(proposal.id, voteAsFamily, 'yes')}
                          className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                            myVote === 'yes'
                              ? 'bg-green-500 text-white'
                              : 'bg-green-50 text-green-700 hover:bg-green-100'
                          }`}
                        >
                          👍 We're in!
                        </button>
                        <button
                          onClick={() => onCastVote(proposal.id, voteAsFamily, 'no')}
                          className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                            myVote === 'no'
                              ? 'bg-red-500 text-white'
                              : 'bg-red-50 text-red-700 hover:bg-red-100'
                          }`}
                        >
                          👎 Pass
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {!isEditing && proposal.timestamp && (
                <div className="px-4 py-2 bg-gray-50 border-t border-gray-100">
                  <p className="text-xs text-gray-400">
                    {format(parseISO(proposal.timestamp), 'MMM d, h:mm a')}
                  </p>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
