import React, { Suspense } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { Stack } from 'expo-router';
import { SQLiteProvider } from 'expo-sqlite';
import { StatusBar } from 'expo-status-bar';
import { migrateDatabase } from '../db/client';
import { ThemeProvider, useAppTheme } from '../context/ThemeContext';
import { PhotoDraftProvider } from '../context/PhotoDraftContext';

function AppNavigator() {
  const { palette: p } = useAppTheme();
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
    </Stack>
  </>;
}

function Loading() {
  return <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F6F5F0' }}><Text style={{ color: '#526A4B', fontSize: 32, fontWeight: '600', letterSpacing: -1 }}>zenvy</Text><ActivityIndicator color="#526A4B" style={{ marginTop: 14 }} /></View>;
}

export default function RootLayout() {
  return <Suspense fallback={<Loading />}><SQLiteProvider databaseName="zenvy.db" onInit={migrateDatabase} useSuspense><ThemeProvider><PhotoDraftProvider><AppNavigator /></PhotoDraftProvider></ThemeProvider></SQLiteProvider></Suspense>;
}
