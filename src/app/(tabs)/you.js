import React, { useCallback, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { Avatar, Card, Metric, PageHeader, Screen, SectionTitle } from '../../components/UI';
import { getWardrobeStats } from '../../db/repository';
import { useAppTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';

export default function YouScreen() {
  const db = useSQLiteContext();
  const { palette: p, themeName, palettes, changeTheme } = useAppTheme();
  const { user, mode, logout } = useAuth();
  const [stats, setStats] = useState({ total: 44, favorites: 9, wardrobe_value: 7240 });
  useFocusEffect(useCallback(() => { let active = true; getWardrobeStats(db).then((row) => { if (active && row) setStats(row); }).catch(() => {}); return () => { active = false; }; }, [db]));

  return <Screen contentStyle={styles.screen}>
    <PageHeader eyebrow="YOUR ZENVY SPACE" title="A little more you" subtitle="Your wardrobe, your ideas, your own way of doing things." action="ÃƒÂ¢Ã…Â¡Ã¢â€žÂ¢" onAction={() => Alert.alert('App settings', 'Your data stays on this device. Theme and reading layouts are saved automatically.')} />
    <View style={[styles.profileHero, { backgroundColor: p.surfaceAlt }]}><Avatar name={user?.name || 'Alex Morgan'} size={73} /><Text style={[styles.profileEyebrow, { color: p.primary }]}>YOUR PERSONAL EDIT</Text><Text style={[styles.profileName, { color: p.ink }]}>{user?.name || 'Alex Morgan'}</Text><Text style={[styles.profileSub, { color: p.muted }]}>{user?.email || 'Finding your own kind of lovely since 2024'}</Text><Pressable onPress={() => Alert.alert('Profile', 'Your profile details are managed by your connected Zenvy account.')} style={[styles.editProfile, { borderColor: p.border }]}><Text style={[styles.editProfileText, { color: p.primary }]}>Edit profile</Text></Pressable></View>
    <Card style={styles.metrics}><Metric value={stats.total || 0} label="pieces in your closet" /><View style={[styles.divider, { backgroundColor: p.border }]} /><Metric value={stats.favorites || 0} label="saved favourites" /><View style={[styles.divider, { backgroundColor: p.border }]} /><Metric value={`${Math.round(stats.wardrobe_value || 0)}`} label="wardrobe value Ãƒâ€šÃ‚Â· sample" /></Card>

    <SectionTitle title="Your personal style" />
    <Card style={styles.themeCard}><Text style={[styles.themeTitle, { color: p.ink }]}>Set the mood</Text><Text style={[styles.themeBody, { color: p.muted }]}>Four quiet palettes, saved just for this device.</Text><View style={styles.themeList}>{Object.entries(palettes).map(([key, palette]) => <Pressable key={key} onPress={() => changeTheme(key)} style={[styles.themeOption, { borderColor: themeName === key ? p.primary : p.border, backgroundColor: p.surface }]}><View style={[styles.swatch, { backgroundColor: palette.background }]}><View style={[styles.swatchLine, { backgroundColor: palette.primary }]} /><View style={[styles.swatchDot, { backgroundColor: palette.accent }]} /></View><Text style={[styles.themeLabel, { color: p.ink }]}>{palette.label}</Text><View style={[styles.radio, { borderColor: themeName === key ? p.primary : p.border }]}>{themeName === key ? <View style={[styles.radioDot, { backgroundColor: p.primary }]} /> : null}</View></Pressable>)}</View></Card>

    <SectionTitle title="Your Zenvy" />
    <MenuRow icon="ÃƒÂ¢Ã¢â‚¬â€œÃ‚Â¦" title="Closet & collections" subtitle="Pieces, categories and favourites" onPress={() => router.push('/wardrobe')} palette={p} />
    <MenuRow icon="ÃƒÂ¢Ã…â€œÃ‚Â³" title="Your style activity" subtitle="Steps, movement and little wins" onPress={() => router.push('/activity')} palette={p} />
    <MenuRow icon="ÃƒÂ¢Ã…â€™Ã¢â‚¬â€œ" title="Local style map" subtitle="Repair shops, vintage & makers" onPress={() => router.push('/nearby')} palette={p} />
    <MenuRow icon="ÃƒÂ¢Ã¢â‚¬â€œÃ‚Â£" title="Outfit planner" subtitle="Plan a week that feels like you" onPress={() => router.push('/planner')} palette={p} />
    <MenuRow icon="ÃƒÂ¢Ã¢â€žÂ¢Ã‚Â¡" title="Share a look" subtitle="Your inspiration, your words" onPress={() => router.push('/share-look')} palette={p} />
    <MenuRow icon="ÃƒÂ¢Ã¢â‚¬â€Ã…â€™" title="Conversations" subtitle="Kind notes from your style circle" onPress={() => router.push('/chat')} palette={p} />
    <MenuRow icon="ÃƒÂ¢Ã…â€œÃ‚Â³" title="Style notes" subtitle="Get help styling your own wardrobe" onPress={() => router.push('/assistant')} palette={p} />
    <MenuRow icon="ÃƒÂ¢Ã¢â€žÂ¢Ã‚Â§" title="Notifications" subtitle="Daily outfit reminders and app notes" onPress={() => router.push('/notifications')} palette={p} />
    <MenuRow icon="ÃƒÂ¢Ã¢â‚¬Â Ã‚Â»" title="WhatÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢s new" subtitle="Version details and release notes" onPress={() => router.push('/updates')} palette={p} />
    <Pressable onPress={() => Alert.alert('Sign out', 'Sign out of this Zenvy profile?', [{ text: 'Cancel', style: 'cancel' }, { text: 'Sign out', style: 'destructive', onPress: logout }])} style={[styles.editProfile, { borderColor: p.border }]}><Text style={{ color: p.primary, fontSize: 10, fontWeight: '700' }}>Sign out Ãƒâ€šÃ‚Â· {mode === 'jwt' ? user?.email : 'demo profile'}</Text></Pressable>
    <View style={styles.footer}><Text style={[styles.brand, { color: p.primary }]}>zenvy</Text><Text style={[styles.footerLine, { color: p.muted }]}>Wear what feels like you.</Text><Text style={[styles.version, { color: p.muted }]}>A LOCAL STYLE COMPANION  Ãƒâ€šÃ‚Â·  1.0.0</Text><Text style={[styles.dataNote, { color: p.muted }]}>Your wardrobe and settings are stored on this device. Trend, journal and nearby place content in this preview is sample data.</Text></View>
  </Screen>;
}

function MenuRow({ icon, title, subtitle, onPress, palette: p }) { return <Pressable onPress={onPress} style={[styles.menuRow, { borderColor: p.border }]}><View style={[styles.menuIcon, { backgroundColor: p.surfaceAlt }]}><Text style={{ color: p.primary, fontSize: 17 }}>{icon}</Text></View><View style={{ flex: 1 }}><Text style={[styles.menuTitle, { color: p.ink }]}>{title}</Text><Text style={[styles.menuSub, { color: p.muted }]}>{subtitle}</Text></View><Text style={{ color: p.primary, fontSize: 18 }}>ÃƒÂ¢Ã¢â‚¬Â Ã¢â‚¬â„¢</Text></Pressable>; }

const styles = StyleSheet.create({ screen: { paddingTop: 13 }, profileHero: { borderRadius: 18, paddingVertical: 22, alignItems: 'center' }, profileEyebrow: { fontSize: 8, fontWeight: '800', letterSpacing: 1.3, marginTop: 12 }, profileName: { fontSize: 24, fontWeight: '700', marginTop: 5, letterSpacing: -0.5 }, profileSub: { fontSize: 9, marginTop: 5 }, editProfile: { borderWidth: 1, paddingHorizontal: 15, paddingVertical: 7, borderRadius: 18, marginTop: 12 }, editProfileText: { fontSize: 9, fontWeight: '700' }, metrics: { flexDirection: 'row', alignItems: 'center', paddingVertical: 15, paddingHorizontal: 3, marginTop: 10 }, divider: { width: 1, height: 28 }, themeCard: { padding: 14 }, themeTitle: { fontSize: 13, fontWeight: '700' }, themeBody: { fontSize: 9, marginTop: 4 }, themeList: { marginTop: 12 }, themeOption: { borderWidth: 1, borderRadius: 11, flexDirection: 'row', alignItems: 'center', padding: 8, marginTop: 7 }, swatch: { width: 48, height: 36, borderRadius: 7, overflow: 'hidden', justifyContent: 'flex-end', padding: 5, flexDirection: 'row', alignItems: 'flex-end' }, swatchLine: { width: 17, height: 4, borderRadius: 2, marginRight: 3 }, swatchDot: { width: 8, height: 8, borderRadius: 5 }, themeLabel: { flex: 1, marginLeft: 10, fontSize: 10, fontWeight: '600' }, radio: { width: 16, height: 16, borderWidth: 1.5, borderRadius: 9, alignItems: 'center', justifyContent: 'center', marginRight: 4 }, radioDot: { width: 8, height: 8, borderRadius: 5 }, menuRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1 }, menuIcon: { width: 39, height: 39, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginRight: 11 }, menuTitle: { fontSize: 11, fontWeight: '700' }, menuSub: { fontSize: 9, marginTop: 3 }, footer: { alignItems: 'center', paddingTop: 33, paddingBottom: 17 }, brand: { fontSize: 33, fontWeight: '600', letterSpacing: -2 }, footerLine: { fontSize: 10, marginTop: 3 }, version: { fontSize: 7, fontWeight: '700', letterSpacing: 1.3, marginTop: 15 }, dataNote: { textAlign: 'center', fontSize: 8, lineHeight: 13, marginTop: 9, maxWidth: 270 },
});
