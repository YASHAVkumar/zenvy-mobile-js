import React, { useCallback, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { Button, Card, PageHeader, Photo, Screen, SectionTitle } from '../../components/UI';
import { deleteWardrobeItem, getWardrobeItem, recordWear, toggleWardrobeFavorite, updateWardrobePhoto } from '../../db/repository';
import { persistWardrobePhoto } from '../../services/mediaService';
import { useAppTheme } from '../../context/ThemeContext';

export default function WardrobeItemScreen() {
  const { id } = useLocalSearchParams();
  const db = useSQLiteContext();
  const { palette: p } = useAppTheme();
  const [item, setItem] = useState(null);
  const refresh = useCallback(() => { getWardrobeItem(db, Number(id)).then(setItem).catch(() => {}); }, [db, id]);
  useFocusEffect(useCallback(() => { refresh(); }, [refresh]));
  const worn = async () => { await recordWear(db, Number(id)); await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); refresh(); };
  const replacePhoto = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsEditing: true, aspect: [4, 5], quality: 0.9 });
    if (!result.canceled) { const uri = await persistWardrobePhoto(result.assets[0].uri); await updateWardrobePhoto(db, Number(id), uri); refresh(); }
  };
  const removeItem = () => Alert.alert('Remove this piece?', 'This removes the item from your local closet and its wear history.', [{ text: 'Keep it', style: 'cancel' }, { text: 'Remove', style: 'destructive', onPress: async () => { await deleteWardrobeItem(db, Number(id)); router.replace('/wardrobe'); } }]);
  if (!item) return <Screen><PageHeader title="Your piece" onBack={() => router.back()} /><Text style={{ color: p.muted }}>Opening your closet…</Text></Screen>;

  return <Screen contentStyle={styles.screen}>
    <PageHeader eyebrow="A PIECE IN YOUR CLOSET" title={item.category} action={item.favorite ? '♥' : '♡'} onAction={async () => { await toggleWardrobeFavorite(db, Number(id)); refresh(); }} onBack={() => router.back()} />
    <Photo uri={item.image_uri} style={styles.photo} />
    <View style={styles.titleRow}><View style={{ flex: 1 }}><Text style={[styles.name, { color: p.ink }]}>{item.name}</Text><Text style={[styles.description, { color: p.muted }]}>{item.color}  ·  {item.season}</Text></View><View style={[styles.favoritePill, { backgroundColor: p.surfaceAlt }]}><Text style={{ color: item.favorite ? '#B66E59' : p.primary, fontSize: 15 }}>{item.favorite ? '♥' : '♡'}</Text></View></View>
    <Card style={styles.wearCard}><View style={[styles.wearIcon, { backgroundColor: p.surfaceAlt }]}><Text style={[styles.wearGlyph, { color: p.primary }]}>↗</Text></View><View style={{ flex: 1 }}><Text style={[styles.wearNumber, { color: p.ink }]}>{item.wears} wears</Text><Text style={[styles.wearSub, { color: p.muted }]}>The more you wear it, the better its story.</Text></View><Text style={[styles.wearCost, { color: p.muted }]}>{item.cost ? `£${Math.round(item.cost / Math.max(item.wears, 1))}/wear` : ''}</Text></Card>
    {item.notes ? <View style={[styles.note, { backgroundColor: p.surfaceAlt }]}><Text style={[styles.noteLabel, { color: p.primary }]}>A NOTE TO YOURSELF</Text><Text style={[styles.noteText, { color: p.ink }]}>{item.notes}</Text></View> : null}
    <Button title="I wore this today" icon="✳" onPress={worn} style={{ marginTop: 17 }} />
    <Button title="Update photo from gallery" icon="▧" variant="secondary" onPress={replacePhoto} style={{ marginTop: 9 }} />
    <Pressable onPress={removeItem} style={styles.delete}><Text style={{ color: p.warning, fontSize: 10, fontWeight: '700' }}>Remove from my closet</Text></Pressable>
    <SectionTitle title="Worn with intention" />
    <View style={[styles.sustainability, { borderColor: p.border }]}><Text style={[styles.sustainabilityNumber, { color: p.primary }]}>{item.wears > 0 ? Math.round(item.wears * 1.7) : 0}</Text><Text style={[styles.sustainabilityText, { color: p.muted }]}>estimated outfit moments with this piece</Text><Text style={[styles.sustainabilityFootnote, { color: p.muted }]}>A playful estimate based on your wear count, not a sustainability audit.</Text></View>
  </Screen>;
}

const styles = StyleSheet.create({ screen: { paddingTop: 13 }, photo: { width: '100%', height: 385, borderRadius: 18 }, titleRow: { flexDirection: 'row', alignItems: 'center', marginTop: 15 }, name: { fontSize: 24, fontWeight: '700', letterSpacing: -0.7 }, description: { fontSize: 10, marginTop: 6 }, favoritePill: { width: 42, height: 42, alignItems: 'center', justifyContent: 'center', borderRadius: 14, marginLeft: 10 }, wearCard: { flexDirection: 'row', alignItems: 'center', padding: 11, marginTop: 15 }, wearIcon: { width: 37, height: 37, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginRight: 10 }, wearGlyph: { fontSize: 20 }, wearNumber: { fontSize: 12, fontWeight: '700' }, wearSub: { fontSize: 8, marginTop: 4 }, wearCost: { fontSize: 8 }, note: { padding: 13, borderRadius: 13, marginTop: 12 }, noteLabel: { fontSize: 7, fontWeight: '800', letterSpacing: 1.2 }, noteText: { fontSize: 10, marginTop: 6 }, delete: { alignItems: 'center', padding: 14 }, sustainability: { borderWidth: 1, borderRadius: 14, padding: 15, marginBottom: 17 }, sustainabilityNumber: { fontSize: 28, fontWeight: '700' }, sustainabilityText: { fontSize: 9, marginTop: 3 }, sustainabilityFootnote: { fontSize: 7, lineHeight: 11, marginTop: 10 },
});
