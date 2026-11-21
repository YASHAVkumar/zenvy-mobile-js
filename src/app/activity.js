import React, { useEffect, useRef, useState } from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import { Accelerometer, Pedometer } from 'expo-sensors';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { Button, Card, Metric, PageHeader, Screen, SectionTitle } from '../components/UI';
import { useAppTheme } from '../context/ThemeContext';
import { useSQLiteContext } from 'expo-sqlite';
import { getActivityBaseline } from '../db/repository';

const STEP_GOAL = 8000;

export default function ActivityScreen() {
  const { palette: p } = useAppTheme();
  const db = useSQLiteContext();
  const [steps, setSteps] = useState(null);
  const [sampleSteps, setSampleSteps] = useState(6842);
  const [pedometerState, setPedometerState] = useState('checking');
  const [motionAvailable, setMotionAvailable] = useState(false);
  const [movementMoments, setMovementMoments] = useState(0);
  const lastMotion = useRef(0);

  useEffect(() => { getActivityBaseline(db).then((baseline) => { if (baseline) setSampleSteps(baseline); }).catch(() => {}); }, [db]);

  useEffect(() => {
    let active = true;
    let stepSubscription;
    let motionSubscription;
    (async () => {
      try {
        const permission = await Pedometer.requestPermissionsAsync();
        if (!permission.granted) {
          if (active) setPedometerState('permission-denied');
        } else {
          const available = await Pedometer.isAvailableAsync();
          if (!active) return;
          setPedometerState(available ? 'live' : 'unavailable');
          if (available) {
            if (Platform.OS === 'ios') {
              const end = new Date();
              const start = new Date(end.getFullYear(), end.getMonth(), end.getDate());
              const today = await Pedometer.getStepCountAsync(start, end).catch(() => null);
              if (active && today) setSteps(today.steps);
            }
            const watchCounter = { value: 0 };
            stepSubscription = Pedometer.watchStepCount((result) => {
              const increment = Math.max(0, result.steps - watchCounter.value);
              watchCounter.value = result.steps;
              if (increment) setSteps((current) => (current || 0) + increment);
            });
          }
        }
      } catch (_error) {
        if (active) setPedometerState('unavailable');
      }
      try {
        const available = await Accelerometer.isAvailableAsync();
        if (!active || !available) return;
        setMotionAvailable(true);
        Accelerometer.setUpdateInterval(700);
        motionSubscription = Accelerometer.addListener(({ x, y, z }) => {
          const magnitude = Math.sqrt(x * x + y * y + z * z);
          const now = Date.now();
          if ((magnitude > 1.65 || magnitude < 0.38) && now - lastMotion.current > 2200) {
            lastMotion.current = now;
            setMovementMoments((count) => count + 1);
            Haptics.selectionAsync().catch(() => {});
          }
        });
      } catch (_error) {
        if (active) setMotionAvailable(false);
      }
    })();
    return () => { active = false; stepSubscription?.remove(); motionSubscription?.remove(); };
  }, []);

  const visibleSteps = steps ?? sampleSteps;
  const progress = Math.min(visibleSteps / STEP_GOAL, 1);
  const stepsLeft = Math.max(STEP_GOAL - visibleSteps, 0);
  return <Screen contentStyle={styles.screen}>
    <PageHeader eyebrow="A GENTLER WAY TO KEEP TRACK" title="Your activity" subtitle="A little movement, a little fresh air, a little time for you." onBack={() => router.back()} />
    <View style={[styles.stepCard, { backgroundColor: p.primaryDeep }]}><View style={styles.stepHeader}><View><Text style={styles.stepEyebrow}>TODAY’S STEPS</Text><Text style={styles.stepNumber}>{visibleSteps.toLocaleString()}</Text><Text style={styles.stepCaption}>{pedometerState === 'live' ? 'Steps from your phone’s pedometer' : 'Sample baseline · connect a sensor to update'}</Text></View><Text style={styles.stepIcon}>↗</Text></View><View style={styles.progressTrack}><View style={[styles.progressFill, { width: `${progress * 100}%` }]} /></View><View style={styles.goalRow}><Text style={styles.goalText}>{Math.round(progress * 100)}% of your daily intention</Text><Text style={styles.goalText}>{stepsLeft ? `${stepsLeft.toLocaleString()} to go` : 'Little goal met ✳'}</Text></View></View>
    <Card style={styles.statCard}><Metric value={`${(visibleSteps * 0.0007).toFixed(1)} km`} label="a lovely little walk" /><View style={[styles.divider, { backgroundColor: p.border }]} /><Metric value={`${Math.round(visibleSteps / 105)} min`} label="time on your feet" /><View style={[styles.divider, { backgroundColor: p.border }]} /><Metric value="8,000" label="gentle daily goal" /></Card>
    <SectionTitle title="Move in your own way" />
    <Card style={styles.motionCard}><View style={[styles.motionIconWrap, { backgroundColor: p.surfaceAlt }]}><Text style={[styles.motionIcon, { color: p.primary }]}>⌁</Text></View><View style={{ flex: 1 }}><Text style={[styles.motionTitle, { color: p.ink }]}>Phone motion</Text><Text style={[styles.motionBody, { color: p.muted }]}>{motionAvailable ? 'Your accelerometer is connected. Zenvy notices gentle movement while this page is open.' : 'Motion data is not available on this device.'}</Text></View><View style={[styles.status, { backgroundColor: motionAvailable ? p.primary : p.border }]} /></Card>
    <Card style={styles.movementCard}><Text style={[styles.movementEyebrow, { color: p.primary }]}>LITTLE MOVEMENT MOMENTS</Text><Text style={[styles.movementNumber, { color: p.ink }]}>{movementMoments}</Text><Text style={[styles.movementText, { color: p.muted }]}>gentle movements noticed during this session</Text><Text style={[styles.movementFootnote, { color: p.muted }]}>This is a playful motion signal, not a health or fitness measurement.</Text></Card>
    {Platform.OS === 'android' && <View style={[styles.info, { backgroundColor: p.surfaceAlt }]}><Text style={[styles.infoText, { color: p.ink }]}>For live step counting on Android, install a development build so Android can grant the activity recognition permission. Expo Go may report the pedometer as unavailable.</Text></View>}
    <Button title="Find a lovely local walk" icon="⌖" onPress={() => router.push('/nearby')} variant="secondary" style={{ marginTop: 15 }} />
  </Screen>;
}

const styles = StyleSheet.create({ screen: { paddingTop: 13 }, stepCard: { borderRadius: 19, padding: 17 }, stepHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }, stepEyebrow: { color: '#E0ECA7', fontSize: 8, fontWeight: '800', letterSpacing: 1.4 }, stepNumber: { color: '#FFFFFF', fontSize: 45, fontWeight: '600', letterSpacing: -1.8, marginTop: 7 }, stepCaption: { color: 'rgba(255,255,255,.74)', fontSize: 9, marginTop: 4 }, stepIcon: { color: '#DCEB89', fontSize: 24 }, progressTrack: { height: 7, borderRadius: 5, backgroundColor: 'rgba(255,255,255,.22)', overflow: 'hidden', marginTop: 22 }, progressFill: { height: '100%', backgroundColor: '#DCEB89', borderRadius: 5 }, goalRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 9 }, goalText: { color: 'rgba(255,255,255,.82)', fontSize: 8 }, statCard: { flexDirection: 'row', alignItems: 'center', paddingVertical: 15, paddingHorizontal: 3, marginTop: 10 }, divider: { width: 1, height: 30 }, motionCard: { flexDirection: 'row', alignItems: 'center', padding: 12 }, motionIconWrap: { width: 39, height: 39, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginRight: 10 }, motionIcon: { fontSize: 22 }, motionTitle: { fontSize: 11, fontWeight: '700' }, motionBody: { fontSize: 8, lineHeight: 13, marginTop: 4 }, status: { width: 8, height: 8, borderRadius: 5, marginLeft: 8 }, movementCard: { marginTop: 10 }, movementEyebrow: { fontSize: 7, fontWeight: '800', letterSpacing: 1.2 }, movementNumber: { fontSize: 36, fontWeight: '700', marginTop: 6 }, movementText: { fontSize: 9 }, movementFootnote: { fontSize: 8, lineHeight: 12, marginTop: 11 }, info: { padding: 12, borderRadius: 11, marginTop: 12 }, infoText: { fontSize: 9, lineHeight: 14 },
});
