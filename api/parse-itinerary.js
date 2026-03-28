export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const apiKey = (process.env.ANTHROPIC_API_KEY || '').trim()
  if (!apiKey) {
    return res.status(500).json({ error: 'ANTHROPIC_API_KEY not configured' })
  }

  const { text, existingItems } = req.body

  const systemPrompt = `You are an itinerary parser. Given raw text from Apple Notes, Google Docs, or any other source, extract a structured list of activities.

Output ONLY a valid JSON array of objects. Each object must have these fields:
- "date": in YYYY-MM-DD format (assume year 2026 unless specified). If a date says "APR 6" that means "2026-04-06".
- "time": in HH:MM 24-hour format (e.g. "09:00", "18:00"). If a range like "9:00-10:30", use the start time "09:00". If "6:00 PM" convert to "18:00". If no time specified, use "".
- "activity": the name/description of the activity. Keep it concise but informative.
- "location": the place/address if mentioned. Use "" if not specified.
- "notes": any extra details, sub-items, or context. Use "" if none.

Rules:
- Skip section headers (city names, date ranges), separators, and URLs
- Skip spa/restaurant reference lists that aren't part of the day-by-day schedule
- Indented sub-items under an activity should be merged into the parent activity's "notes" field
- Each bullet point or time-stamped item becomes one activity
- If text says "DAY 1 — Monday APR 6" then all following items until the next DAY header get date "2026-04-06"
- Be smart about merging related items (e.g. "Lunch" with sub-items "Samwon garden" and "Sam's Korean bbq" becomes one activity with notes)
- Do NOT include items that are just notes/context (like "**Rose works 3-5pm" — include as notes on the first activity of that day instead)

Output ONLY the JSON array, no markdown, no explanation.`

  const userMessage = existingItems
    ? `Here is the raw itinerary text to parse:\n\n${text}\n\nFor context, here are the existing activities for this family (do NOT include these in your output, only parse the NEW text above):\n${JSON.stringify(existingItems)}`
    : `Here is the raw itinerary text to parse:\n\n${text}`

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 4096,
        system: systemPrompt,
        messages: [{ role: 'user', content: userMessage }],
      }),
    })

    if (!response.ok) {
      const err = await response.text()
      return res.status(response.status).json({ error: err })
    }

    const data = await response.json()
    const text_response = data.content[0].text

    // Extract JSON array from response
    const jsonMatch = text_response.match(/\[[\s\S]*\]/)
    if (!jsonMatch) {
      return res.status(400).json({ error: 'Could not parse response into activities' })
    }

    const items = JSON.parse(jsonMatch[0])
    return res.status(200).json({ items })
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
}
