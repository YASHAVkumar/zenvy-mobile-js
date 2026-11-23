async function getStyleSuggestion(message, config) {
  const prompt = String(message || '').trim();
  if (!prompt || prompt.length > 4000) throw Object.assign(new Error('Tell your style guide what you need in 1 to 4000 characters.'), { status: 400 });
  if (config.styleAiUrl) {
    let response;
    try {
      response = await fetch(config.styleAiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(config.styleAiKey ? { Authorization: `Bearer ${config.styleAiKey}` } : {}) },
        body: JSON.stringify({ message: prompt }),
        signal: AbortSignal.timeout(15_000),
      });
    } catch { throw Object.assign(new Error('Your style guide is unavailable right now.'), { status: 503 }); }
    if (!response.ok) throw Object.assign(new Error('Your style guide is unavailable right now.'), { status: 503 });
    const result = await response.json().catch(() => null);
    if (typeof result?.reply !== 'string' || !result.reply.trim()) throw Object.assign(new Error('The style service returned an invalid reply.'), { status: 502 });
    return result.reply.trim().slice(0, 4000);
  }
  const lower = prompt.toLowerCase();
  if (lower.includes('rain')) return 'For a rainy day, start with the soft structure coat over your stripe shirt. Straight denim and trainers keep the layers comfortable.';
  if (lower.includes('colour') || lower.includes('color')) return 'Try a gentle colour story from pieces you already own: olive, natural cream and vintage blue. Repeat one shade in a small accessory.';
  return 'Try the Sunday blazer over your cashmere knit with the vintage straight jeans. Keep the trainers easy and add the cognac tote for warmth.';
}

module.exports = { getStyleSuggestion };
