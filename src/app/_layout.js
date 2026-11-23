import React, { Suspense, useEffect } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { Stack, useSegments, useRouter } from 'expo-router';
import { SQLiteProvider } from 'expo-sqlite';
import { StatusBar } from 'expo-status-bar';
import { migrateDatabase } from '../db/client';
import { ThemeProvider, useAppTheme } from '../context/ThemeContext';
import { PhotoDraftProvider } from '../context/PhotoDraftContext';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { addNotificationTapListener } from '../services/notificationService';

function AppNavigator() {
  const { palette: p } = useAppTheme();
  const { ready, user } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  useEffect(() => {
    const subscription = addNotificationTapListener((route) => router.push(route));
    return () => subscription.remove();
  }, [router]);
  useEffect(() => {
    if (!ready) return;
    const inAuth = segments[0] === 'auth';
    if (!user && !inAuth) router.replace('/auth');
    else if (user && inAuth) router.replace('/(tabs)');
  }, [ready, user, segments, router]);
  if (!ready || (!user && segments[0] !== 'auth')) return <Loading />;
  return <>
    <StatusBar style={p.background === '#141A16' ? 'light' : 'dark'} />
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: p.background }, animation: 'slide_from_right' }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="capture" options={{ presentation: 'fullScreenModal', animation: 'slide_from_bottom' }} />
      <Stack.Screen name="new-item" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
      <Stack.Screen name="share-look" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
      <Stack.Screen name="nearby" />
      <Stack.Screen name="activity" />
      <Stack.Screen name="planner" />
      <Stack.Screen name="item/[id]" />
      <Stack.Screen name="article/[id]" />
      <Stack.Screen name="auth" />
      <Stack.Screen name="member/[id]" />
      <Stack.Screen name="chat" />
      <Stack.Screen name="chat/new" />
      <Stack.Screen name="chat/[id]" />
      <Stack.Screen name="assistant" />
      <Stack.Screen name="notifications" />
      <Stack.Screen name="updates" />
    </Stack>
  </>;
}

function Loading() {
  return <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F6F5F0' }}><Text style={{ color: '#526A4B', fontSize: 32, fontWeight: '600', letterSpacing: -1 }}>zenvy</Text><ActivityIndicator color="#526A4B" style={{ marginTop: 14 }} /></View>;
}

export default function RootLayout() {
  return <Suspense fallback={<Loading />}><SQLiteProvider databaseName="zenvy.db" onInit={migrateDatabase} useSuspense><ThemeProvider><AuthProvider><PhotoDraftProvider><AppNavigator /></PhotoDraftProvider></AuthProvider></ThemeProvider></SQLiteProvider></Suspense>;
}
