# Zenvy Mobile

Zenvy is an offline-first style companion built with Expo SDK 57, React Native, Expo Router, and SQLite. It is a mobile application prototype with seeded editorial and community data; user-created wardrobe pieces, wear history, bookmarks, posts, plans, and preferences persist on the device.

## Run

```sh
npm install
npx expo start
```

Open the app on an iOS or Android device. Camera and location prompts appear only when you start those features. Trend and editorial images are loaded from Unsplash, so the seed photography needs an internet connection.

Run the code quality check with:

```sh
npx expo lint
```

## Product areas

- **Today:** daily style edit, wardrobe insights, trends, activity shortcut, and local discovery.
- **Closet:** add from the live camera or photo library, search and filter, switch grid/list layouts, favourite pieces, track wears, replace photos, and remove pieces.
- **Discover:** daily trend notes, mosaic/list layouts, community outfit posts, likes, bookmarks, and photo sharing.
- **Community diaries:** follow creators, view outfit history for seven seeded days, and explore a Following feed.
- **Conversations:** demo chat inbox and persistent local message history, with JWT-protected API adapters for account sync.
- **Style notes:** a wardrobe-aware demo style guide that can call a configured assistant endpoint.
- **Notifications:** local daily outfit reminders, in-app preview notes, and an optional device push-token registration endpoint.
- **App updates:** current app/build version, release notes feed, and a guarded Expo Updates check.
- **Journal:** editorial feature, searchable stories, editorial/grid/list layouts, bookmarks, and article detail pages.
- **Outfit planner:** a rolling week, selectable dates, outfit ideas, and saved outfit assignments.
- **Around you:** foreground location permission, reverse-geocoded city, local repair/resale/maker suggestions, and map search links.
- **Activity:** live pedometer when available, accelerometer movement moments, an activity goal, and local walk shortcut.
- **You:** persistent theme choices, wardrobe summary, auth controls, and shortcuts to social and phone features.

## Project structure

```text
src/
  app/          Expo Router layouts, tab screens, and feature routes
  components/   Shared accessible UI primitives
  context/      Authentication, persisted themes, and local drafts
  data/         Sample wardrobe, journal, community, trend, and outfit records
  db/           Versioned SQLite schema, sample seeding, and domain repositories
  services/     API, JWT session, camera/photo, location, notifications, chat, and assistant adapters
  theme/        Shared multi-palette design tokens
server/
  src/
    http/           Request limits and HTTP transport
    middleware/     JWT authentication
    repositories/   SQLite access for chat and creator histories
    security/       Signed JWTs and scrypt password hashing
    services/       Authentication and account setup
```

## Local data and device capabilities

SQLite seeds sample content once and stores user-created data locally in zenvy.db. On iOS and Android, photos are copied into the app documents directory before their URIs are stored. The browser preview keeps the selected browser photo URI. Journal, trends, nearby places, notifications, and community profiles start from sample content.

## Connecting a backend

Copy .env.example to .env and set EXPO_PUBLIC_API_URL. Login and registration then expect JWT responses from POST /auth/login and POST /auth/register; protected feature routes and payloads are documented in docs/API_CONTRACT.md. Keep signing keys and push-service credentials on the server. Local demo mode does not validate credentials against a remote account.

The companion API lives in server/. Copy server/.env.example to server/.env, replace JWT_SECRET with a long random value, and run npm --prefix server start. It uses Node 24 built-in SQLite and stores its database under server/data. For the Expo app, use localhost for web/iOS simulators; Android emulators typically reach the host computer at 10.0.2.2, and a physical phone needs the computer's LAN address.

For remote push registration and app updates, set the real EXPO_PUBLIC_EAS_PROJECT_ID, create a development or release build, and configure an Expo update channel. Local scheduled reminders work without a server. Remote chat, account synchronization, and community profiles need an API deployment; no backend credentials or project IDs are included in this repository.

The app requests camera, photo-library, foreground location, and motion access only for features that need them. Android pedometer access needs a development build: Expo Go for Android does not include Android's activity-recognition permission. When the device sensor is unavailable, the activity page labels its step count as a sample baseline.
