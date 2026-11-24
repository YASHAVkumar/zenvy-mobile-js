import { apiRequest, isApiConfigured } from './apiClient';

export async function loadRemoteConversations(token) {
  if (!isApiConfigured) return null;
  const result = await apiRequest('/chat/conversations', { token });
  return Array.isArray(result?.conversations) ? result.conversations : [];
}
export async function loadRemoteMessages(id, token) {
  if (!isApiConfigured) return null;
  const result = await apiRequest(`/chat/conversations/${encodeURIComponent(id)}/messages`, { token });
  return Array.isArray(result?.messages) ? result.messages : [];
}
export async function sendRemoteMessage(id, body, token) {
  if (!isApiConfigured) return null;
  return apiRequest(`/chat/conversations/${encodeURIComponent(id)}/messages`, { method: 'POST', token, body: { body } });
}
export async function searchRemoteUsers(query, token) {
  if (!isApiConfigured) return null;
  const result = await apiRequest(`/users/search?q=${encodeURIComponent(query)}`, { token });
  return Array.isArray(result?.users) ? result.users : [];
}
export async function startRemoteConversation(peerUserId, token) {
  if (!isApiConfigured) return null;
  const result = await apiRequest('/chat/conversations', { method: 'POST', token, body: { peerUserId } });
  return result?.conversation || null;
}
