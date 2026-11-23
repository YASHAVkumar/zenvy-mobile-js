import { apiRequest, isApiConfigured } from './apiClient';

export async function fetchRemoteOutfitHistory(creatorId, token) {
  if (!isApiConfigured) return null;
  const result = await apiRequest(`/community/users/${encodeURIComponent(creatorId)}/outfits`, { token });
  return Array.isArray(result?.outfits) ? result.outfits : [];
}
export async function fetchRemoteFollowing(token) {
  if (!isApiConfigured) return null;
  const result = await apiRequest('/community/following', { token });
  return Array.isArray(result?.creators) ? result.creators : [];
}
export async function fetchRemoteFollowingOutfits(token) {
  if (!isApiConfigured) return null;
  const result = await apiRequest('/community/following/outfits', { token });
  return Array.isArray(result?.outfits) ? result.outfits : [];
}
export async function updateRemoteFollow(creatorId, following, token) {
  if (!isApiConfigured) return null;
  return apiRequest(`/community/following/${encodeURIComponent(creatorId)}`, { method: following ? 'PUT' : 'DELETE', token });
}
