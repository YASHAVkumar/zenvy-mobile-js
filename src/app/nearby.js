import React, { useState } from 'react';
import { Alert, Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { Button, Card, PageHeader, Screen } from '../components/UI';
import { nearbySeed } from '../data/mockContent';
import { updateSetting } from '../db/repository';
import { getCityLocation } from '../services/locationService';
import { useAppTheme } from '../context/ThemeContext';

export default function NearbyScreen() {
  const { palette: p } = useAppTheme();
  const db = useSQLiteContext();
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(false);

  const findNearby = async () => {
    setLoading(true);
    try {
      const result = await getCityLocation();
      setLocation(result);
      if (result.city) await updateSetting(db, 'city', result.city);
    } catch (_error) {
      Alert.alert('Couldn’t find your area', 'Check that location services are available and try again.');
    } finally { setLoading(false); }
  };
  const openMap = (place) => {
    const area = location?.city || 'near me';
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${place.name} ${place.type} ${area}`)}`;
    Linking.openURL(url).catch(() => Alert.alert('Maps unavailable', 'Try searching for this spot in your maps app.'));
  };

  return <Screen contentStyle={styles.screen}>
    <PageHeader eyebrow="FIND THE GOOD NEAR YOU" title="Around you" subtitle="Thoughtful places to repair, rewear, and shop small." onBack={() => router.back()} />
    <View style={[styles.locationCard, { backgroundColor: p.primaryDeep }]}><View style={styles.locationTop}><View><Text style={styles.locationEyebrow}>YOUR LOCAL EDIT</Text><Text style={styles.locationTitle}>{location?.city || 'A little closer to home'}</Text><Text style={styles.locationRegion}>{location?.region || 'Discover independent style nearby'}</Text></View><Text style={styles.locationMark}>⌖</Text></View><Text style={styles.locationDescription}>{location?.granted ? `Curated around your current area${location.region ? ` in ${location.region}` : ''}. We only use location while you’re here.` : 'Find local clothing repair, pre-loved stores, makers markets, and gentle garment care.'}</Text><Button title={loading ? 'Finding your area…' : location?.granted ? 'Refresh my local edit' : 'Use my current location'} onPress={findNearby} icon="⌖" style={styles.locationButton} disabled={loading} /></View>
    {location && !location.granted ? <View style={[styles.permissionNote, { backgroundColor: p.surfaceAlt }]}><Text style={[styles.noteText, { color: p.ink }]}>{location.message}</Text></View> : null}
    <View style={styles.resultsHeader}><Text style={[styles.resultsTitle, { color: p.ink }]}>Good things, close by</Text><Text style={[styles.resultsCount, { color: p.muted }]}>{nearbySeed.length} PLACES</Text></View>
    {nearbySeed.map((place) => <Card key={place.id} style={styles.placeCard}><View style={[styles.placeGlyph, { backgroundColor: p.surfaceAlt }]}><Text style={[styles.placeIcon, { color: p.primary }]}>{place.icon}</Text></View><View style={styles.placeCopy}><Text style={[styles.placeType, { color: p.primary }]}>{place.type.toUpperCase()}</Text><Text style={[styles.placeName, { color: p.ink }]}>{place.name}</Text><Text style={[styles.placeAddress, { color: p.muted }]}>{place.address}</Text><Text style={[styles.placeDistance, { color: p.muted }]}>{location?.granted ? 'In your local area' : `${place.distance} · ${location?.city || 'London sample'}`}</Text></View><Pressable accessibilityRole="button" accessibilityLabel={`Find ${place.name} in maps`} onPress={() => openMap(place)} style={[styles.mapButton, { backgroundColor: p.surfaceAlt }]}><Text style={[styles.mapArrow, { color: p.primary }]}>↗</Text></Pressable></Card>)}
    <View style={[styles.privacy, { borderColor: p.border }]}><Text style={[styles.privacyIcon, { color: p.primary }]}>⌖</Text><Text style={[styles.privacyText, { color: p.muted }]}>Your location is requested only when you tap the button. Zenvy does not track you in the background. Nearby businesses shown here are sample content, and map results open in your maps app.</Text></View>
  </Screen>;
}

const styles = StyleSheet.create({ screen: { paddingTop: 13 }, locationCard: { borderRadius: 18, padding: 18, marginBottom: 20 }, locationTop: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' }, locationEyebrow: { color: '#DCEB89', fontSize: 8, fontWeight: '800', letterSpacing: 1.5 }, locationTitle: { color: '#FFFFFF', fontSize: 24, fontWeight: '600', marginTop: 8, letterSpacing: -0.5 }, locationRegion: { color: 'rgba(255,255,255,.73)', fontSize: 10, marginTop: 4 }, locationMark: { color: '#DCEB89', fontSize: 28 }, locationDescription: { color: 'rgba(255,255,255,.82)', fontSize: 10, lineHeight: 16, marginTop: 14, marginBottom: 15 }, locationButton: { backgroundColor: '#DCEB89', borderColor: '#DCEB89', alignSelf: 'flex-start' }, resultsHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }, resultsTitle: { fontSize: 17, fontWeight: '700' }, resultsCount: { fontSize: 8, fontWeight: '800', letterSpacing: 1.1 }, placeCard: { flexDirection: 'row', alignItems: 'center', padding: 12, marginBottom: 9 }, placeGlyph: { width: 42, height: 42, borderRadius: 13, alignItems: 'center', justifyContent: 'center', marginRight: 11 }, placeIcon: { fontSize: 20 }, placeCopy: { flex: 1 }, placeType: { fontSize: 7, fontWeight: '800', letterSpacing: 1 }, placeName: { fontSize: 12, fontWeight: '700', marginTop: 4 }, placeAddress: { fontSize: 9, marginTop: 3 }, placeDistance: { fontSize: 8, marginTop: 5 }, mapButton: { width: 34, height: 34, borderRadius: 11, alignItems: 'center', justifyContent: 'center', marginLeft: 6 }, mapArrow: { fontSize: 16 }, permissionNote: { borderRadius: 11, padding: 11, marginTop: -9, marginBottom: 17 }, noteText: { fontSize: 9, lineHeight: 14 }, privacy: { borderTopWidth: 1, paddingTop: 14, marginTop: 10, flexDirection: 'row', alignItems: 'flex-start', marginBottom: 20 }, privacyIcon: { fontSize: 16, marginRight: 9 }, privacyText: { flex: 1, fontSize: 8, lineHeight: 13 },
});
