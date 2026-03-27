export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const apiKey = (process.env.ANTHROPIC_API_KEY || '').trim()
  if (!apiKey) {
    return res.status(500).json({ error: 'ANTHROPIC_API_KEY not configured' })
  }
  // Debug: show first/last chars of key to verify correct key is loaded
  const keyPreview = apiKey.slice(0, 7) + '...' + apiKey.slice(-4)

  const { messages, itineraryContext } = req.body

  const systemPrompt = `You are a friendly and knowledgeable trip concierge for a group of 4 families (Hua, Ku, Kim, and DeAragon) traveling together to Taiwan and South Korea in spring 2026.

You have access to all their itineraries below. Use this information to:
- Answer questions about the trip schedule, overlaps, and logistics
- Suggest restaurants, activities, and things to do near their planned locations
- Help coordinate meetups between families
- Give practical travel tips for Taiwan and Korea (transit, payments, language, customs)
- Recommend what to pack, what apps to download, etc.
- Help with translations (English ↔ Korean ↔ Chinese)

Be concise, warm, and practical. Use emojis sparingly. If you don't know something specific, say so rather than guessing.

=== ITINERARY DATA ===
${itineraryContext}
=== END ITINERARY ===`

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-3-haiku-20240307',
        max_tokens: 1024,
        system: systemPrompt,
        messages: messages.map(m => ({
          role: m.role,
          content: m.content,
        })),
      }),
    })

    if (!response.ok) {
      const err = await response.text()
      return res.status(response.status).json({ error: err, keyPreview })
    }

    const data = await response.json()
    return res.status(200).json({
      reply: data.content[0].text,
    })
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
}
