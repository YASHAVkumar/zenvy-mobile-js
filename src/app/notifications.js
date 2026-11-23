import React, { useCallback, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { Button, Card, PageHeader, Screen, SectionTitle } from '../components/UI';
import { getNotificationPreferences, updateReminderPreference } from '../db/repository';
import { cancelOutfitReminder, registerPushDevice, scheduleOutfitReminder, sendLocalNotification } from '../services/notificationService';
import { useAuth } from '../context/AuthContext';
import { useAppTheme } from '../context/ThemeContext';

const examples = [
  { icon: '✳', title: 'Your morning outfit moment', body: 'A gentle nudge to plan something that feels like you.', time: 'Every day · 8:30 am' },
  { icon: '◌', title: 'A new note from Mila', body: 'I found a great way to style that blazer.', time: 'Today · 9:14 am' },
  { icon: '↻', title: 'Your weekly style recap', body: 'You made 12 outfit repeats this week. Lovely.', time: 'Sunday · 6:00 pm' },
];
export default function NotificationsScreen() {
  const db = useSQLiteContext(); const { palette: p } = useAppTheme(); const { session } = useAuth(); const [enabled, setEnabled] = useState(false); const [busy, setBusy] = useState(false); const [pushStatus, setPushStatus] = useState('');
  useFocusEffect(useCallback(() => { let active = true; getNotificationPreferences(db).then((row) => { if (active) setEnabled(Boolean(row?.outfit_reminder)); }); return () => { active = false; }; }, [db]));
  const toggle = async () => {
    setBusy(true);
    try {
      if (enabled) { await cancelOutfitReminder(); await updateReminderPreference(db, false); setEnabled(false); }
      else { await scheduleOutfitReminder(8, 30); await updateReminderPreference(db, true, 8, 30); setEnabled(true); }
    } catch (error) { Alert.alert('Notifications', error.message || 'Could not update notification settings.'); }
    finally { setBusy(false); }
  };
  const preview = async () => { try { await sendLocalNotification('A little Zenvy note ✨', 'Your outfit ideas are waiting whenever you are.'); } catch (error) { Alert.alert('Notification preview', error.message); } };
  const connectPush = async () => {
    try { setPushStatus('Connecting this device…'); await registerPushDevice(session?.accessToken); setPushStatus('This device is ready for account notifications.'); }
    catch (error) { setPushStatus(error.message || 'Could not connect push notifications.'); }
  };
  return <Screen contentStyle={styles.screen}>
    <PageHeader eyebrow="A FEW GOOD REMINDERS" title="Notifications" subtitle="Small notes to make getting dressed feel a little easier." onBack={() => router.back()} />
    <Card style={styles.reminder}><View style={styles.row}><View style={[styles.icon, { backgroundColor: p.surfaceAlt }]}><Text style={{ fontSize: 20, color: p.primary }}>◷</Text></View><View style={{ flex: 1 }}><Text style={[styles.title, { color: p.ink }]}>Daily outfit moment</Text><Text style={[styles.subtitle, { color: p.muted }]}>A gentle reminder at 8:30 am</Text></View><Text style={{ color: enabled ? p.primary : p.muted, fontSize: 10, fontWeight: '800' }}>{enabled ? 'ON' : 'OFF'}</Text></View><Button title={busy ? 'Updating…' : enabled ? 'Turn reminder off' : 'Turn on daily reminder'} variant={enabled ? 'secondary' : 'primary'} onPress={toggle} disabled={busy} style={{ marginTop: 14 }} /><Text style={[styles.helper, { color: p.muted }]}>Scheduled on this device. You can change notification permission in phone settings.</Text></Card>
    <Button title="Send a notification preview" variant="secondary" onPress={preview} style={{ marginTop: 11 }} />
    <Button title="Connect remote account notifications" variant="secondary" onPress={connectPush} style={{ marginTop: 8 }} />
    {pushStatus ? <Text style={[styles.note, { color: p.muted }]}>{pushStatus}</Text> : null}
    <SectionTitle title="Your recent notes" />
    {examples.map((item) => <Card key={item.title} style={styles.item}><View style={[styles.icon, { backgroundColor: p.surfaceAlt }]}><Text style={{ fontSize: 17, color: p.primary }}>{item.icon}</Text></View><View style={{ flex: 1 }}><Text style={[styles.title, { color: p.ink }]}>{item.title}</Text><Text style={[styles.subtitle, { color: p.muted }]}>{item.body}</Text><Text style={[styles.time, { color: p.primary }]}>{item.time}</Text></View></Card>)}
    <Text style={[styles.note, { color: p.muted }]}>The recent notes are sample data. Remote push delivery needs a development build and a configured server.</Text>
  </Screen>;
}
const styles = StyleSheet.create({ screen: { paddingTop: 12 }, reminder: { padding: 15 }, row: { flexDirection: 'row', alignItems: 'center' }, icon: { width: 39, height: 39, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 11 }, title: { fontSize: 11, fontWeight: '700' }, subtitle: { fontSize: 9, lineHeight: 14, marginTop: 4 }, helper: { fontSize: 8, lineHeight: 13, textAlign: 'center', marginTop: 9 }, item: { flexDirection: 'row', alignItems: 'center', padding: 11, marginBottom: 8 }, time: { fontSize: 7, fontWeight: '700', letterSpacing: 0.6, marginTop: 6 }, note: { fontSize: 8, lineHeight: 13, textAlign: 'center', marginTop: 12 },
});
