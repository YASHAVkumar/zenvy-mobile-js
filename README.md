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
- **Journal:** editorial feature, searchable stories, editorial/grid/list layouts, bookmarks, and article detail pages.
- **Outfit planner:** a rolling week, selectable dates, outfit ideas, and saved outfit assignments.
- **Around you:** foreground location permission, reverse-geocoded city, local repair/resale/maker suggestions, and map search links.
- **Activity:** live pedometer when available, accelerometer movement moments, an activity goal, and local walk shortcut.
- **You:** persistent theme choices, wardrobe summary, and feature shortcuts.

## Project structure

```text
src/
  app/          Expo Router layouts, tab screens, and feature routes
  components/   Shared accessible UI primitives
  context/      Persistent theme and layout preferences
  data/         Sample wardrobe, journal, community, trend, and outfit records
  db/           Versioned SQLite setup and domain repositories
  services/     Camera photo storage and location access
  theme/        Shared multi-palette design tokens
```

## Local data and device capabilities

SQLite seeds sample content once and stores user-created data locally in `zenvy.db`. On iOS and Android, photos are copied into the app documents directory before their URIs are stored. The browser preview keeps the selected browser photo URI. Sample journal stories, trends, nearby places, and community profiles are not live services; no login, cloud sync, weather API, or remote content API is configured.

The app requests camera, photo-library, foreground location, and motion access only for features that need them. Android pedometer access needs a development build: Expo Go for Android does not include Android's activity-recognition permission. When the device sensor is unavailable, the activity page labels its step count as a sample baseline.
