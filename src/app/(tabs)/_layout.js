import React from 'react';
import { Text } from 'react-native';
import { Tabs } from 'expo-router';
import { useAppTheme } from '../../context/ThemeContext';

const glyphs = { index: '⌂', wardrobe: '▦', trends: '✳', journal: '▤', you: '◯' };
const titles = { index: 'Today', wardrobe: 'Closet', trends: 'Discover', journal: 'Journal', you: 'You' };

export default function TabLayout() {
  const { palette: p } = useAppTheme();
  return <Tabs screenOptions={({ route }) => ({
    headerShown: false,
    tabBarActiveTintColor: p.primary,
    tabBarInactiveTintColor: p.muted,
    tabBarStyle: { height: 72, paddingTop: 8, paddingBottom: 9, backgroundColor: p.tab, borderTopColor: p.border },
    tabBarLabelStyle: { fontSize: 9, fontWeight: '600' },
    tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20, lineHeight: 23 }}>{glyphs[route.name] || '○'}</Text>,
    tabBarLabel: titles[route.name] || route.name,
  })}>
    <Tabs.Screen name="index" />
    <Tabs.Screen name="wardrobe" />
    <Tabs.Screen name="trends" />
    <Tabs.Screen name="journal" />
    <Tabs.Screen name="you" />
  </Tabs>;
}
