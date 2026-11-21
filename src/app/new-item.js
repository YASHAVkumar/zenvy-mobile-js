import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { Button, Chip, PageHeader, Photo, Screen } from '../components/UI';
import { addWardrobeItem } from '../db/repository';
import { persistWardrobePhoto } from '../services/mediaService';
import { useAppTheme } from '../context/ThemeContext';
import { usePhotoDraft } from '../context/PhotoDraftContext';

const categories = ['Tops', 'Knitwear', 'Bottoms', 'Dresses', 'Outerwear', 'Shoes', 'Accessories'];
const seasons = ['All year', 'Spring', 'Summer', 'Autumn', 'Winter'];

export default function NewItemScreen() {
  const { palette: p } = useAppTheme();
  const db = useSQLiteContext();
  const { draftPhoto, setDraftPhoto } = usePhotoDraft();
  const [localPhoto, setPhoto] = useState('');
  const photo = localPhoto || draftPhoto || '';
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Tops');
  const [color, setColor] = useState('');
  const [season, setSeason] = useState('All year');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  const pickPhoto = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsEditing: true, aspect: [4, 5], quality: 0.9 });
    if (!result.canceled) setPhoto(result.assets[0].uri);
  };
  const save = async () => {
    if (!name.trim()) { Alert.alert('Add a name first', 'Give this piece a name you’ll remember.'); return; }
    if (!photo) { Alert.alert('Add a photo', 'Take a photo or choose one from your gallery to continue.'); return; }
    setSaving(true);
    try {
      const imageUri = await persistWardrobePhoto(photo);
      await addWardrobeItem(db, { name, category, color, season, imageUri, notes });
      setDraftPhoto(null);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.dismissAll();
      router.replace('/wardrobe');
    } catch (_error) {
      Alert.alert('Couldn’t save this piece', 'Please check your photo and try again.');
      setSaving(false);
    }
  };

  return <Screen contentStyle={styles.screen}>
    <PageHeader eyebrow="A NEW LITTLE FAVOURITE" title="Add to your closet" subtitle="Make a record of a piece you love." onBack={() => router.back()} />
    <View style={styles.photoArea}>
      {photo ? <Photo uri={photo} style={styles.preview} /> : <View style={[styles.photoPlaceholder, { backgroundColor: p.surfaceAlt, borderColor: p.border }]}><Text style={[styles.photoIcon, { color: p.primary }]}>▧</Text><Text style={[styles.photoTitle, { color: p.ink }]}>Give it a portrait</Text><Text style={[styles.photoHint, { color: p.muted }]}>A clear, natural-light photo works beautifully.</Text></View>}
    </View>
    <View style={styles.photoActions}><Button title="Take a photo" onPress={() => { setPhoto(''); setDraftPhoto(null); router.push('/capture'); }} icon="◎" style={{ flex: 1, marginRight: 7 }} /><Button title="Choose photo" variant="secondary" onPress={pickPhoto} icon="▧" style={{ flex: 1, marginLeft: 7 }} /></View>
    <Field label="WHAT DO YOU CALL IT?" value={name} onChangeText={setName} placeholder="e.g. The Sunday blazer" palette={p} />
    <Text style={[styles.fieldLabel, { color: p.muted }]}>WHICH PART OF YOUR CLOSET?</Text><ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>{categories.map((item) => <Chip key={item} label={item} active={item === category} onPress={() => setCategory(item)} />)}</ScrollView>
    <Field label="COLOUR / DESCRIPTION" value={color} onChangeText={setColor} placeholder="e.g. warm oat" palette={p} />
    <Text style={[styles.fieldLabel, { color: p.muted }]}>WHEN WILL YOU WEAR IT?</Text><ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>{seasons.map((item) => <Chip key={item} label={item} active={item === season} onPress={() => setSeason(item)} />)}</ScrollView>
    <Field label="A NOTE TO FUTURE YOU (OPTIONAL)" value={notes} onChangeText={setNotes} placeholder="The perfect layer for…" palette={p} multiline />
    <Button title={saving ? 'Saving your piece…' : 'Save to my closet'} icon="✳" onPress={save} disabled={saving} style={{ marginTop: 7, marginBottom: 25 }} />
  </Screen>;
}

function Field({ label, value, onChangeText, placeholder, palette: p, multiline = false }) {
  return <View style={styles.field}><Text style={[styles.fieldLabel, { color: p.muted }]}>{label}</Text><TextInput value={value} onChangeText={onChangeText} placeholder={placeholder} placeholderTextColor={p.muted} multiline={multiline} style={[styles.input, { color: p.ink, backgroundColor: p.surface, borderColor: p.border }, multiline && { height: 82, textAlignVertical: 'top' }]} /></View>;
}

const styles = StyleSheet.create({ screen: { paddingTop: 13 }, photoArea: { height: 250, borderRadius: 19, overflow: 'hidden', marginBottom: 11 }, preview: { width: '100%', height: '100%' }, photoPlaceholder: { flex: 1, borderWidth: 1, borderStyle: 'dashed', borderRadius: 19, alignItems: 'center', justifyContent: 'center', padding: 24 }, photoIcon: { fontSize: 28, marginBottom: 8 }, photoTitle: { fontSize: 14, fontWeight: '700' }, photoHint: { fontSize: 10, marginTop: 6, textAlign: 'center' }, photoActions: { flexDirection: 'row', marginBottom: 22 }, field: { marginBottom: 16 }, fieldLabel: { fontSize: 8, fontWeight: '800', letterSpacing: 1.4, marginBottom: 8 }, input: { borderWidth: 1, borderRadius: 12, minHeight: 46, paddingHorizontal: 13, paddingVertical: 11, fontSize: 12 }, chips: { paddingBottom: 4, marginBottom: 13 },
});
