import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { apiRequest, isApiConfigured } from './apiClient';

const SESSION_KEY = 'zenvy.session.v1';
async function readSession() {
  const raw = Platform.OS === 'web' ? globalThis.localStorage?.getItem(SESSION_KEY) : await SecureStore.getItemAsync(SESSION_KEY);
  return raw ? JSON.parse(raw) : null;
}
async function writeSession(session) {
  const raw = JSON.stringify(session);
  if (Platform.OS === 'web') globalThis.localStorage?.setItem(SESSION_KEY, raw);
  else await SecureStore.setItemAsync(SESSION_KEY, raw);
}
export async function restoreSession() { return readSession(); }
export async function signIn({ email, password }) {
  if (isApiConfigured) {
    const result = await apiRequest('/auth/login', { method: 'POST', body: { email, password } });
    if (!result?.accessToken || !result?.user) throw new Error('The API response must include accessToken and user.');
    const session = { mode: 'jwt', accessToken: result.accessToken, user: result.user };
    await writeSession(session); return session;
  }
  const name = email.split('@')[0].replace(/[._-]+/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase()) || 'Alex Morgan';
  const session = { mode: 'demo', accessToken: `demo.${Date.now()}`, user: { id: 'demo-user', name, email } };
  await writeSession(session); return session;
}
export async function signUp({ name, email, password }) {
  if (isApiConfigured) {
    const result = await apiRequest('/auth/register', { method: 'POST', body: { name, email, password } });
    if (!result?.accessToken || !result?.user) throw new Error('The API response must include accessToken and user.');
    const session = { mode: 'jwt', accessToken: result.accessToken, user: result.user };
    await writeSession(session); return session;
  }
  const session = { mode: 'demo', accessToken: `demo.${Date.now()}`, user: { id: 'demo-user', name: name.trim(), email } };
  await writeSession(session); return session;
}
export async function clearSession() {
  if (Platform.OS === 'web') globalThis.localStorage?.removeItem(SESSION_KEY);
  else await SecureStore.deleteItemAsync(SESSION_KEY);
}
