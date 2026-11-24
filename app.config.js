const config = require('./app.json');

module.exports = ({ config: expoConfig }) => ({
  ...config.expo,
  ...expoConfig,
  runtimeVersion: expoConfig.runtimeVersion || { policy: 'appVersion' },
  ...(process.env.EXPO_PUBLIC_EAS_PROJECT_ID ? {
    updates: { ...expoConfig.updates, url: `https://u.expo.dev/${process.env.EXPO_PUBLIC_EAS_PROJECT_ID}`, checkAutomatically: 'ON_LOAD' },
  } : {}),
  extra: {
    ...expoConfig.extra,
    eas: { ...expoConfig.extra?.eas, ...(process.env.EXPO_PUBLIC_EAS_PROJECT_ID ? { projectId: process.env.EXPO_PUBLIC_EAS_PROJECT_ID } : {}) },
    apiUrl: process.env.EXPO_PUBLIC_API_URL || '',
    appVersionFeedUrl: process.env.EXPO_PUBLIC_APP_VERSION_FEED_URL || '',
  },
});
