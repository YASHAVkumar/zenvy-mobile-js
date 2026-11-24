import Constants from 'expo-constants';

const API_URL = (Constants.expoConfig?.extra?.apiUrl || '').replace(/\/$/, '');
export const isApiConfigured = Boolean(API_URL);

/** @param {string} path @param {{ method?: string, token?: string, body?: unknown, headers?: Record<string, string> }} options */
export async function apiRequest(path, { method = 'GET', token, body, headers = {} } = {}) {
  if (!API_URL) throw new Error('Set EXPO_PUBLIC_API_URL to connect a Zenvy API.');
  const response = await fetch(`${API_URL}${path}`, {
    method,
    headers: { Accept: 'application/json', ...(body ? { 'Content-Type': 'application/json' } : {}), ...(token ? { Authorization: `Bearer ${token}` } : {}), ...headers },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  const payload = response.status === 204 ? null : await response.json().catch(() => null);
  if (!response.ok) throw new Error(payload?.message || `Request failed (${response.status}).`);
  return payload;
}
