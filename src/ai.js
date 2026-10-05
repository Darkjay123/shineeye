// Optional AI second look. Only runs when GEMINI_API_KEY is set.
// Gemini may suggest extra warning signs, but every suggestion must quote the pitch word for word.
// Any quote that is not actually in the message is thrown away, so the AI cannot invent evidence.

const MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
const TIMEOUT_MS = 8000;

const PROMPT = (text) => `You review investment pitches forwarded on WhatsApp in Nigeria for Ponzi warning signs.
Return a JSON array (max 4 items) of warning signs in the message below that are NOT one of these already-covered types:
guaranteed returns, very high returns, referral rewards, urgency, trading/forex/mining stories, withdrawal conditions, paying into a personal account or wallet, CAC registration used as proof, payout testimonials.
Each item: {"label": short name in English, "why": one plain sentence, "quote": the exact words copied character for character from the message}.
If there is nothing extra, return [].

MESSAGE:
"""${text}"""`;

export function keepRealQuotes(text, suggestions, existing = []) {
  const out = [];
  for (const s of Array.isArray(suggestions) ? suggestions : []) {
    const quote = String(s?.quote || '').trim();
    if (quote.length < 4) continue;
    const start = text.indexOf(quote);
    if (start === -1) continue; // not in the message: invented, drop it
    const end = start + quote.length;
    const overlaps = [...existing, ...out].some((f) => start < f.end && end > f.start);
    if (overlaps) continue;
    out.push({ id: 'ai', label: String(s.label || 'Warning sign').slice(0, 60), why: String(s.why || '').slice(0, 220), quote, start, end, source: 'ai' });
  }
  return out;
}

export async function aiFlags(text, existing = [], fetchImpl = globalThis.fetch) {
  const key = process.env.GEMINI_API_KEY;
  if (!key) return [];
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  try {
    const res = await fetchImpl(`https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`, {
      method: 'POST',
      signal: ctrl.signal,
      headers: { 'content-type': 'application/json', 'x-goog-api-key': key },
      body: JSON.stringify({
        contents: [{ parts: [{ text: PROMPT(text) }] }],
        generationConfig: { responseMimeType: 'application/json', temperature: 0 },
      }),
    });
    if (!res.ok) return [];
    const data = await res.json();
    const raw = data?.candidates?.[0]?.content?.parts?.[0]?.text || '[]';
    return keepRealQuotes(text, JSON.parse(raw), existing);
  } catch {
    return [];
  } finally {
    clearTimeout(timer);
  }
}
