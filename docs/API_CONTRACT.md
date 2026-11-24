# Zenvy API contract

The app is offline-first. With EXPO_PUBLIC_API_URL unset, sign-in is an explicitly labelled local demo, wardrobe and conversations stay in SQLite, and no password is retained. Set the public API URL to activate the JWT-backed service adapters.

All protected endpoints accept Authorization: Bearer <accessToken>. API errors should return { "message": "Readable explanation" }. JSON endpoints should return application/json.

## Authentication

| Method | Path | Request | Response |
| --- | --- | --- | --- |
| POST | /auth/register | { "name", "email", "password" } | { "accessToken", "user": { "id", "name", "email" } } |
| POST | /auth/login | { "email", "password" } | { "accessToken", "user": { "id", "name", "email" } } |

Tokens are stored in SecureStore on iOS and Android. A backend should issue short-lived signed JWT access tokens over HTTPS and enforce authorization on every protected request.

## Style community

| Method | Path | Response |
| --- | --- | --- |
| GET | /community/users/{creatorId}/outfits | { "outfits": [{ "id", "display_name", "outfit_title", "caption", "image_uri", "location", "worn_on" }] } |
| PUT | /community/following/{creatorId} | Follow creator |
| DELETE | /community/following/{creatorId} | Unfollow creator |
| GET | /community/following | { "creators": [{ "creator_id", "display_name", "location", "avatar_uri" }] } |
| GET | /community/following/outfits | { "outfits": [seven-day diary entries for followed creators] } |
| GET | /users/search?q={name} | { "users": [{ "id", "name" }] } |
| POST | /chat/conversations | { "peerUserId" } → { "conversation": { "id", "peer_name", "peer_handle", "peer_avatar" } } |

Outfit history is presented by calendar day. Store explicit consent and creator visibility rules before serving another person's outfit diary.

## Messaging and style guide

| Method | Path | Request / response |
| --- | --- | --- |
| GET | /chat/conversations | { "conversations": [{ "id", "peer_name", "peer_handle", "peer_avatar", "last_message" }] } |
| GET | /chat/conversations/{id}/messages | { "messages": [{ "id", "sender", "body", "sent_at" }] } |
| POST | /chat/conversations/{id}/messages | { "body" } |
| POST | /style/assistant | { "message" } → { "reply" } |

The demo style guide uses seeded local examples. Configure STYLE_AI_URL on the server to call a private style service that accepts { "message" } and returns { "reply" }; STYLE_AI_API_KEY is sent only as a server-side bearer credential. The app sends a prompt with a compact list of the account owner's wardrobe item names; do not forward photos or sensitive personal data unless the user explicitly opts in.

Direct conversations between registered accounts are stored for both participants under the same conversation id. Community creator conversations remain local sample threads.

## Notifications and releases

| Method | Path | Request / response |
| --- | --- | --- |
| POST | /me/push-token | { "token", "platform" } |
| GET | configured by EXPO_PUBLIC_APP_VERSION_FEED_URL | { "releases": [{ "version", "date", "title", "body" }] } |

Push delivery must be sent by a trusted server through Expo Push Service or APNs/FCM. Never include service credentials in EXPO_PUBLIC variables or the mobile app. EAS Update must be linked to the real project ID and release channel before the app can download published JavaScript updates.
