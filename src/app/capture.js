import React, { useRef, useState } from 'react';
import { ActivityIndicator, Pressable, StatusBar, StyleSheet, Text, View } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as Haptics from 'expo-haptics';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../components/UI';
import { useAppTheme } from '../context/ThemeContext';
import { usePhotoDraft } from '../context/PhotoDraftContext';

/** @type {import('react-native-safe-area-context').Edge[]} */
const CAMERA_EDGES = ['top', 'bottom'];

export default function CaptureScreen() {
  const { palette: p } = useAppTheme();
  const params = useLocalSearchParams();
  const { setDraftPhoto } = usePhotoDraft();
  const camera = useRef(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState(/** @type {import('expo-camera').CameraType} */ ('back'));
  const [cameraReady, setCameraReady] = useState(false);
  const [busy, setBusy] = useState(false);

  const capture = async () => {
    if (!camera.current || !cameraReady || busy) return;
    setBusy(true);
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      const photo = await camera.current.takePictureAsync({ quality: 0.88, exif: false });
      setDraftPhoto(photo.uri);
      router.replace(params.returnTo === '/share-look' ? '/share-look' : '/new-item');
    } catch (_error) {
      setBusy(false);
    }
  };

  if (!permission) return <View style={[styles.center, { backgroundColor: '#111' }]}><ActivityIndicator color="#FFF" /></View>;
  if (!permission.granted) return <SafeAreaView style={[styles.permission, { backgroundColor: p.background }]}><Text style={[styles.title, { color: p.ink }]}>Make room for a new favourite</Text><Text style={[styles.body, { color: p.muted }]}>Zenvy needs camera access so you can photograph pieces for your wardrobe.</Text><Button title="Allow camera access" onPress={requestPermission} /><Pressable onPress={() => router.back()}><Text style={[styles.cancelText, { color: p.primary }]}>Maybe later</Text></Pressable></SafeAreaView>;

  return <View style={styles.cameraShell}><StatusBar hidden /><CameraView ref={camera} style={StyleSheet.absoluteFill} facing={facing} onCameraReady={() => setCameraReady(true)} /><SafeAreaView style={styles.cameraOverlay} edges={CAMERA_EDGES}><View style={styles.topBar}><Pressable onPress={() => router.back()} style={styles.closeButton}><Text style={styles.closeText}>×</Text></Pressable><View style={styles.cameraLabel}><Text style={styles.cameraLabelTitle}>WARDROBE CAMERA</Text><Text style={styles.cameraLabelSub}>Find a little good light</Text></View><View style={{ width: 42 }} /></View><View style={styles.focusGuide}><View style={styles.cornerTL} /><View style={styles.cornerTR} /><View style={styles.cornerBL} /><View style={styles.cornerBR} /><Text style={styles.focusHint}>Frame your piece</Text></View><View style={styles.bottomBar}><Text style={styles.bottomHint}>Photograph it on a hanger or laid flat</Text><Pressable disabled={!cameraReady || busy} onPress={capture} style={[styles.shutterOuter, (!cameraReady || busy) && { opacity: 0.55 }]}><View style={styles.shutterInner}>{busy ? <ActivityIndicator color="#384833" /> : null}</View></Pressable><Pressable style={styles.flipButton} onPress={() => setFacing((current) => current === 'back' ? 'front' : 'back')}><Text style={styles.flipGlyph}>↻</Text></Pressable></View></SafeAreaView></View>;
}

const styles = StyleSheet.create({
  cameraShell: { flex: 1, backgroundColor: '#101310' }, cameraOverlay: { flex: 1, justifyContent: 'space-between', paddingHorizontal: 21 }, topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 7 }, closeButton: { width: 42, height: 42, borderRadius: 21, backgroundColor: 'rgba(15,19,15,.45)', alignItems: 'center', justifyContent: 'center' }, closeText: { color: '#FFFFFF', fontSize: 27, lineHeight: 30, fontWeight: '300' }, cameraLabel: { alignItems: 'center' }, cameraLabelTitle: { color: '#FFFFFF', fontSize: 9, fontWeight: '800', letterSpacing: 1.8 }, cameraLabelSub: { color: 'rgba(255,255,255,.72)', fontSize: 10, marginTop: 4 }, focusGuide: { alignSelf: 'center', width: '82%', height: '48%', alignItems: 'center', justifyContent: 'center' }, focusHint: { color: '#FFFFFF', fontSize: 11, letterSpacing: 1, fontWeight: '600', textShadowColor: 'rgba(0,0,0,.4)', textShadowRadius: 6 }, cornerTL: { position: 'absolute', top: 0, left: 0, width: 34, height: 34, borderTopWidth: 2, borderLeftWidth: 2, borderColor: '#E2EF9C', borderTopLeftRadius: 10 }, cornerTR: { position: 'absolute', top: 0, right: 0, width: 34, height: 34, borderTopWidth: 2, borderRightWidth: 2, borderColor: '#E2EF9C', borderTopRightRadius: 10 }, cornerBL: { position: 'absolute', bottom: 0, left: 0, width: 34, height: 34, borderBottomWidth: 2, borderLeftWidth: 2, borderColor: '#E2EF9C', borderBottomLeftRadius: 10 }, cornerBR: { position: 'absolute', bottom: 0, right: 0, width: 34, height: 34, borderBottomWidth: 2, borderRightWidth: 2, borderColor: '#E2EF9C', borderBottomRightRadius: 10 }, bottomBar: { alignItems: 'center', justifyContent: 'center', paddingBottom: 8 }, bottomHint: { color: 'rgba(255,255,255,.82)', fontSize: 10, marginBottom: 17 }, shutterOuter: { width: 74, height: 74, borderRadius: 37, borderWidth: 3, borderColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,.16)' }, shutterInner: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#E2EF9C', alignItems: 'center', justifyContent: 'center' }, flipButton: { position: 'absolute', right: 11, bottom: 22, width: 43, height: 43, borderRadius: 22, backgroundColor: 'rgba(15,19,15,.45)', alignItems: 'center', justifyContent: 'center' }, flipGlyph: { color: '#FFF', fontSize: 24 }, permission: { flex: 1, justifyContent: 'center', padding: 27 }, title: { fontSize: 24, fontWeight: '600', letterSpacing: -0.6, textAlign: 'center' }, body: { fontSize: 12, textAlign: 'center', lineHeight: 19, marginVertical: 12 }, cancelText: { textAlign: 'center', fontSize: 11, fontWeight: '700', padding: 18 }, center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
