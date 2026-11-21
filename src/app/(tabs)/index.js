import React, { useCallback, useState } from 'react';
import { ImageBackground, Pressable, StyleSheet, Text, View } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { Avatar, Card, Metric, Photo, Screen, SectionTitle } from '../../components/UI';
import { getWardrobeStats } from '../../db/repository';
import { trendSeed } from '../../data/mockContent';
import { useAppTheme } from '../../context/ThemeContext';

export default function HomeScreen() {
  const db = useSQLiteContext();
  const { palette: p } = useAppTheme();
  const [stats, setStats] = useState({ total: 44, favorites: 9, average_wears: 11 });
  const [greeting] = useState(() => {
    const hour = new Date().getHours();
    return hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
  });
  useFocusEffect(useCallback(() => {
    let active = true;
    getWardrobeStats(db).then((row) => { if (active && row?.total) setStats(row); }).catch(() => {});
    return () => { active = false; };
  }, [db]));
  const date = new Intl.DateTimeFormat(undefined, { weekday: 'long', month: 'long', day: 'numeric' }).format(new Date());

  return (
    <Screen contentStyle={styles.screen}>
      <View style={styles.topline}>
        <View><Text style={[styles.date, { color: p.muted }]}>{date.toUpperCase()}</Text><Text style={[styles.greeting, { color: p.ink }]}>{greeting}, Alex <Text style={{ color: p.primary }}>✳</Text></Text></View>
        <Pressable onPress={() => router.push('/you')}><Avatar size={45} /></Pressable>
      </View>

      <ImageBackground source={{ uri: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1200&q=88' }} imageStyle={styles.heroImage} style={styles.hero}>
        <View style={styles.heroShade} />
        <View style={styles.heroTop}><View style={styles.liveBadge}><View style={styles.liveDot} /><Text style={styles.liveText}>YOUR DAILY EDIT</Text></View><Text style={styles.heroCount}>01 / 04</Text></View>
        <View style={styles.heroBottom}><Text style={styles.heroKicker}>A LITTLE INSPIRATION FOR TODAY</Text><Text style={styles.heroTitle}>Dress like{ '\n' }you mean it.</Text><Text style={styles.heroSubtitle}>A few pieces you already love, put together a new way.</Text><Pressable onPress={() => router.push('/planner')} style={styles.heroButton}><Text style={styles.heroButtonText}>SEE TODAY’S LOOK  →</Text></Pressable></View>
      </ImageBackground>

      <Pressable onPress={() => router.push('/nearby')} style={[styles.weatherCard, { backgroundColor: p.surface, borderColor: p.border }]}>
        <View style={[styles.weatherIcon, { backgroundColor: p.surfaceAlt }]}><Text style={[styles.weatherGlyph, { color: p.primary }]}>☼</Text></View><View style={{ flex: 1 }}><Text style={[styles.weatherTitle, { color: p.ink }]}>A lovely day for layers</Text><Text style={[styles.weatherText, { color: p.muted }]}>Check your local style forecast</Text></View><Text style={[styles.chevron, { color: p.primary }]}>→</Text>
      </Pressable>

      <SectionTitle title="Your wardrobe, in a nutshell" action="Open closet" onPress={() => router.push('/wardrobe')} />
      <Card style={styles.statsCard}><Metric value={stats.total || 0} label="pieces you love" /><View style={[styles.metricDivider, { backgroundColor: p.border }]} /><Metric value={stats.favorites || 0} label="little favourites" /><View style={[styles.metricDivider, { backgroundColor: p.border }]} /><Metric value={`${stats.average_wears || 0}×`} label="average wears" /></Card>

      <SectionTitle title="On your style radar" action="Explore trends" onPress={() => router.push('/trends')} />
      <View style={styles.trendRow}>{trendSeed.slice(0, 2).map((trend) => <Pressable key={trend.id} onPress={() => router.push('/trends')} style={[styles.trendTile, { backgroundColor: p.surfaceAlt }]}><Photo uri={trend.image} style={styles.trendPhoto} /><View style={styles.trendOverlay}><Text style={styles.trendCategory}>{trend.category}</Text><Text style={styles.trendTitle}>{trend.title}</Text></View></Pressable>)}</View>

      <SectionTitle title="A good day has a rhythm" action="Your activity" onPress={() => router.push('/activity')} />
      <Card style={styles.activityCard}><View style={[styles.activityBadge, { backgroundColor: p.surfaceAlt }]}><Text style={[styles.activityIcon, { color: p.primary }]}>↗</Text></View><View style={{ flex: 1 }}><Text style={[styles.activityTitle, { color: p.ink }]}>Move a little, feel a little brighter</Text><Text style={[styles.activitySub, { color: p.muted }]}>Connect your phone’s step counter for daily movement insights.</Text></View><Text style={[styles.activityArrow, { color: p.primary }]}>→</Text></Card>

      <SectionTitle title="Your little shortcuts" />
      <View style={styles.quickGrid}>
        <QuickAction icon="＋" title="Add a piece" subtitle="Camera or gallery" onPress={() => router.push('/new-item')} palette={p} />
        <QuickAction icon="⌖" title="Around you" subtitle="Local style spots" onPress={() => router.push('/nearby')} palette={p} />
        <QuickAction icon="▣" title="Plan the week" subtitle="Outfit calendar" onPress={() => router.push('/planner')} palette={p} />
        <QuickAction icon="▤" title="Style journal" subtitle="Ideas & stories" onPress={() => router.push('/journal')} palette={p} />
      </View>
      <Text style={[styles.footerNote, { color: p.muted }]}>WEAR WHAT FEELS LIKE YOU.</Text>
    </Screen>
  );
}

function QuickAction({ icon, title, subtitle, onPress, palette: p }) {
  return <Pressable onPress={onPress} style={[styles.quickAction, { backgroundColor: p.surface, borderColor: p.border }]}><Text style={[styles.quickIcon, { color: p.primary }]}>{icon}</Text><Text style={[styles.quickTitle, { color: p.ink }]}>{title}</Text><Text style={[styles.quickSub, { color: p.muted }]}>{subtitle}</Text></Pressable>;
}

const styles = StyleSheet.create({
  screen: { paddingTop: 12 }, topline: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 19 }, date: { fontSize: 8, fontWeight: '700', letterSpacing: 1.6 }, greeting: { fontSize: 22, fontWeight: '600', letterSpacing: -0.7, marginTop: 5 },
  hero: { minHeight: 345, borderRadius: 23, overflow: 'hidden', justifyContent: 'space-between', padding: 18, backgroundColor: '#6F7367' }, heroImage: { borderRadius: 23 }, heroShade: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(21,29,23,0.4)' }, heroTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }, liveBadge: { backgroundColor: 'rgba(255,255,255,.91)', borderRadius: 20, paddingVertical: 8, paddingHorizontal: 11, flexDirection: 'row', alignItems: 'center' }, liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#65845B', marginRight: 7 }, liveText: { color: '#394535', fontSize: 8, fontWeight: '800', letterSpacing: 1.2 }, heroCount: { color: '#FFFFFF', fontSize: 9, fontWeight: '700', letterSpacing: 1.2 }, heroBottom: { alignItems: 'flex-start', paddingBottom: 2 }, heroKicker: { color: '#DCEB89', fontSize: 8, fontWeight: '700', letterSpacing: 1.6, marginBottom: 9 }, heroTitle: { color: '#FFFFFF', fontSize: 39, lineHeight: 40, fontWeight: '500', letterSpacing: -1.5 }, heroSubtitle: { color: 'rgba(255,255,255,.87)', maxWidth: 250, fontSize: 11, lineHeight: 16, marginTop: 9 }, heroButton: { marginTop: 17, backgroundColor: '#DCEB89', borderRadius: 10, paddingVertical: 12, paddingHorizontal: 14 }, heroButtonText: { color: '#2C362A', fontWeight: '800', fontSize: 9, letterSpacing: 0.5 },
  weatherCard: { flexDirection: 'row', alignItems: 'center', borderRadius: 15, borderWidth: 1, padding: 12, marginTop: 12 }, weatherIcon: { width: 39, height: 39, borderRadius: 13, alignItems: 'center', justifyContent: 'center', marginRight: 11 }, weatherGlyph: { fontSize: 23 }, weatherTitle: { fontSize: 11, fontWeight: '700' }, weatherText: { fontSize: 9, marginTop: 4 }, chevron: { fontSize: 19, marginHorizontal: 4 }, statsCard: { flexDirection: 'row', alignItems: 'center', paddingVertical: 17, paddingHorizontal: 5 }, metricDivider: { width: 1, height: 30 },
  trendRow: { flexDirection: 'row', gap: 10 }, trendTile: { flex: 1, height: 155, borderRadius: 15, overflow: 'hidden' }, trendPhoto: { width: '100%', height: '100%' }, trendOverlay: { ...StyleSheet.absoluteFill, justifyContent: 'flex-end', padding: 11, backgroundColor: 'rgba(20,25,20,.2)' }, trendCategory: { color: '#F0F0E9', fontSize: 7, fontWeight: '800', letterSpacing: 1.1 }, trendTitle: { color: '#FFFFFF', fontSize: 16, fontWeight: '600', marginTop: 5 }, activityCard: { flexDirection: 'row', alignItems: 'center', padding: 12 }, activityBadge: { width: 39, height: 39, borderRadius: 13, alignItems: 'center', justifyContent: 'center', marginRight: 11 }, activityIcon: { fontSize: 21 }, activityTitle: { fontSize: 11, fontWeight: '700' }, activitySub: { fontSize: 9, lineHeight: 14, marginTop: 4 }, activityArrow: { fontSize: 18, marginLeft: 6 }, quickGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }, quickAction: { width: '48.5%', borderWidth: 1, borderRadius: 15, minHeight: 110, padding: 13, marginBottom: 9 }, quickIcon: { fontSize: 19, marginBottom: 9 }, quickTitle: { fontSize: 11, fontWeight: '700' }, quickSub: { fontSize: 8, marginTop: 4 }, footerNote: { fontSize: 8, fontWeight: '700', letterSpacing: 2, textAlign: 'center', paddingVertical: 18 },
});
