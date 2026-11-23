import React, { useEffect, useState } from 'react';
import { Alert, Platform, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import Constants from 'expo-constants';
import * as Application from 'expo-application';
import * as Updates from 'expo-updates';
import { Button, Card, PageHeader, Screen, SectionTitle } from '../components/UI';
import { useAppTheme } from '../context/ThemeContext';

const releaseNotes = [
  { version: '1.0.0', date: 'November 2026', title: 'A more personal kind of style', body: 'Build your wardrobe, make outfit plans and keep a seven-day community outfit diary. Find nearby repair and vintage spots, browse daily ideas and share looks with your circle.' },
  { version: '0.9.0', date: 'October 2026', title: 'The Zenvy preview', body: 'Camera and gallery capture, local style journal, outfit planning, themes and movement insights arrived in the first preview.' },
];
export default function UpdatesScreen() {
  const { palette: p } = useAppTheme(); const [status, setStatus] = useState('');
  const [feed, setFeed] = useState(releaseNotes);
  useEffect(() => {
    const url = Constants.expoConfig?.extra?.appVersionFeedUrl;
    if (!url) return;
    let active = true;
    fetch(url).then((response) => { if (!response.ok) throw new Error('Release notes are unavailable.'); return response.json(); })
      .then((result) => { if (active && Array.isArray(result?.releases)) setFeed(result.releases); })
      .catch(() => {});
    return () => { active = false; };
  }, []);
  const version = Application.nativeApplicationVersion || Constants.expoConfig?.version || '1.0.0';
  const check = async () => {
    if (Platform.OS === 'web' || !Updates.isEnabled) { setStatus('App updates are not connected in this preview. Configure EAS Update to publish installable updates.'); return; }
    try {
      setStatus('Checking for updates…');
      const result = await Updates.checkForUpdateAsync();
      if (!result.isAvailable) { setStatus('You have the latest version.'); return; }
      await Updates.fetchUpdateAsync(); Alert.alert('Update ready', 'Zenvy has downloaded an update. Restart to apply it?', [{ text: 'Later', style: 'cancel' }, { text: 'Restart now', onPress: () => Updates.reloadAsync() }]);
    } catch (error) { setStatus(error.message || 'Could not check for updates.'); }
  };
  return <Screen contentStyle={styles.screen}>
    <PageHeader eyebrow="A LITTLE SOMETHING NEW" title="What’s new" subtitle="A home for Zenvy notes, improvements and app updates." onBack={() => router.back()} />
    <Card style={styles.current}><Text style={[styles.label, { color: p.primary }]}>YOUR APP VERSION</Text><Text style={[styles.version, { color: p.ink }]}>Zenvy {version}</Text><Text style={[styles.body, { color: p.muted }]}>Build {Application.nativeBuildVersion || 'development'} · {Updates.isEnabled ? 'Update channel connected' : 'Preview build'}</Text><Button title="Check for an app update" onPress={check} style={{ marginTop: 13 }} /><Text style={[styles.status, { color: p.muted }]}>{status}</Text></Card>
    <SectionTitle title="Release notes" />
    {feed.map((item) => <Card key={item.version} style={styles.note}><View style={styles.releaseTop}><View><Text style={[styles.label, { color: p.primary }]}>VERSION {item.version}</Text><Text style={[styles.title, { color: p.ink }]}>{item.title}</Text></View><Text style={[styles.date, { color: p.muted }]}>{item.date}</Text></View><Text style={[styles.body, { color: p.muted }]}>{item.body}</Text></Card>)}
    <Text style={[styles.foot, { color: p.muted }]}>This in-app release feed uses sample notes. Over-the-air updates need an EAS Update project and a native release build.</Text>
  </Screen>;
}
const styles = StyleSheet.create({ screen: { paddingTop: 12 }, current: { padding: 16 }, label: { fontSize: 8, letterSpacing: 1.2, fontWeight: '800' }, version: { fontSize: 24, fontWeight: '700', marginTop: 8 }, body: { fontSize: 10, lineHeight: 16, marginTop: 8 }, status: { fontSize: 9, lineHeight: 14, textAlign: 'center', marginTop: 8 }, note: { padding: 15, marginBottom: 9 }, releaseTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }, title: { fontSize: 14, fontWeight: '700', marginTop: 7 }, date: { fontSize: 8 }, foot: { fontSize: 8, lineHeight: 13, textAlign: 'center', marginTop: 10 } });
