import { apiRequest, isApiConfigured } from './apiClient';

const suggestions = [
  'Try the Sunday blazer over your cashmere knit with the vintage straight jeans. Keep the trainers easy and add the cognac tote for warmth. It uses familiar favourites in a fresh combination.',
  'For a rainy city day, start with your soft structure coat and stripe shirt. Balance the layers with straight denim and trainers. If the weather turns, your knit is an easy extra layer.',
  'A gentle colour story could be olive, natural cream and vintage blue. Repeat one colour in a small accessory to make the outfit feel intentional without buying anything new.',
];
export async function getStyleSuggestion(message, token) {
  if (isApiConfigured) {
    const result = await apiRequest('/style/assistant', { method: 'POST', token, body: { message } });
    return result?.reply || 'I could not find a suggestion just now. Try again in a moment.';
  }
  const lower = message.toLowerCase();
  if (lower.includes('rain') || lower.includes('weather')) return suggestions[1];
  if (lower.includes('color') || lower.includes('colour')) return suggestions[2];
  return suggestions[Math.abs([...message].reduce((sum, char) => sum + char.charCodeAt(0), 0)) % suggestions.length];
}
