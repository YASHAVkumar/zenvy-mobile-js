import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { apiRequest, isApiConfigured } from './apiClient';

if (Platform.OS !== 'web') Notifications.setNotificationHandler({
  handleNotification: async () => ({ shouldPlaySound: false, shouldSetBadge: false, shouldShowBanner: true, shouldShowList: true }),
});

export async function scheduleOutfitReminder(hour = 8, minute = 30) {
  if (Platform.OS === 'web') throw new Error('Outfit reminders are available in the iOS and Android app.');
  const permission = await Notifications.requestPermissionsAsync();
  if (!permission.granted) throw new Error('Allow notifications in your phone settings to turn on reminders.');
  await cancelOutfitReminder();
  return Notifications.scheduleNotificationAsync({
    content: { title: 'A little outfit moment âœ¨', body: 'Your day is starting. What feels like you today?', data: { route: '/planner', reminderKey: 'daily-outfit' } },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.DAILY, hour, minute },
  });
}
export async function cancelOutfitReminder() {
  if (Platform.OS !== 'web') {
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    await Promise.all(scheduled.filter((item) => item.content.data?.reminderKey === 'daily-outfit').map((item) => Notifications.cancelScheduledNotificationAsync(item.identifier)));
  }
}
export async function sendLocalNotification(title, body) {
  if (Platform.OS !== 'web') return Notifications.scheduleNotificationAsync({ content: { title, body }, trigger: null });
  return null;
}

export async function registerPushDevice(token) {
  if (Platform.OS === 'web') throw new Error('Push notifications need an iOS or Android app.');
  if (!isApiConfigured) throw new Error('Configure EXPO_PUBLIC_API_URL to save this device token to your account.');
  const permission = await Notifications.requestPermissionsAsync();
  if (!permission.granted) throw new Error('Allow notifications in your phone settings first.');
  const projectId = Constants.easConfig?.projectId || Constants.expoConfig?.extra?.eas?.projectId;
  if (!projectId) throw new Error('Set EXPO_PUBLIC_EAS_PROJECT_ID before registering push notifications.');
  const result = await Notifications.getExpoPushTokenAsync({ projectId });
  await apiRequest('/me/push-token', { method: 'POST', token, body: { token: result.data, platform: Platform.OS } });
  return result.data;
}

export function addNotificationTapListener(onRoute) {
  if (Platform.OS === 'web') return { remove() {} };
  return Notifications.addNotificationResponseReceivedListener((response) => {
    const route = response.notification.request.content.data?.route;
    if (typeof route === 'string' && route.startsWith('/')) onRoute(route);
  });
}

