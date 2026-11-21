import React, { useEffect, useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { Button, Chip, PageHeader, Photo, Screen } from '../components/UI';
import { addCommunityPost, getSetting } from '../db/repository';
import { persistWardrobePhoto } from '../services/mediaService';
import { useAppTheme } from '../context/ThemeContext';
import { usePhotoDraft } from '../context/PhotoDraftContext';

const topics = ['REWEAR', 'LAYERING', 'COLOUR STORY', 'SLOW SUNDAY', 'EVERYDAY STYLE'];

export default function ShareLookScreen() {
  const db = useSQLiteContext();
  const { palette: p } = useAppTheme();
  const { draftPhoto, setDraftPhoto } = usePhotoDraft();
  const [localPhoto, setPhoto] = useState('');
  const photo = localPhoto || draftPhoto || '';
  const [caption, setCaption] = useState('');
  const [topic, setTopic] = useState('REWEAR');
  const [city, setCity] = useState('London');
  const [saving, setSaving] = useState(false);
  useEffect(() => { getSetting(db).then((setting) => setting?.city && setCity(setting.city)).catch(() => {}); }, [db]);

  const choosePhoto = async () => { const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsEditing: true, aspect: [4, 5], quality: 0.9 }); if (!result.canceled) setPhoto(result.assets[0].uri); };
  const publish = async () => {
    if (!photo) { Alert.alert('Add a photo first', 'Choose an outfit photo from your gallery or camera.'); return; }
    if (caption.trim().length < 8) { Alert.alert('Add a little context', 'Share a sentence about what you’re wearing or why you love it.'); return; }
    setSaving(true);
    try {
      const imageUri = await persistWardrobePhoto(photo);
      await addCommunityPost(db, { creator: 'alex.morgan', handle: 'Alex Morgan', caption: caption.trim(), category: topic, location: city, imageUri });
      setDraftPhoto(null);
      router.dismissAll(); router.replace('/trends');
    } catch (_error) { Alert.alert('Couldn’t share that look', 'Please check the photo and try again.'); setSaving(false); }
  };

  return <Screen contentStyle={styles.screen}>
    <PageHeader eyebrow="YOUR STYLE, YOUR WORDS" title="Share a little look" subtitle="A place for the pieces, moments, and outfits you want to remember." onBack={() => router.back()} />
    {photo ? <Photo uri={photo} style={styles.preview} /> : <View style={[styles.placeholder, { backgroundColor: p.surfaceAlt, borderColor: p.border }]}><Text style={[styles.placeholderIcon, { color: p.primary }]}>▧</Text><Text style={[styles.placeholderTitle, { color: p.ink }]}>A look with a little story</Text><Text style={[styles.placeholderBody, { color: p.muted }]}>Choose a photo you feel good about sharing.</Text></View>}
    <View style={styles.photoActions}><Button title="Choose from gallery" variant="secondary" icon="▧" onPress={choosePhoto} style={{ flex: 1, marginRight: 7 }} /><Button title="Open camera" icon="◎" onPress={() => { setPhoto(''); setDraftPhoto(null); router.push({ pathname: '/capture', params: { returnTo: '/share-look' } }); }} style={{ flex: 1, marginLeft: 7 }} /></View>
    <Text style={[styles.fieldLabel, { color: p.muted }]}>WHAT’S THE STORY?</Text><TextInput value={caption} onChangeText={setCaption} placeholder="A few words about this outfit…" placeholderTextColor={p.muted} multiline maxLength={240} style={[styles.captionInput, { color: p.ink, backgroundColor: p.surface, borderColor: p.border }]} /><Text style={[styles.charCount, { color: p.muted }]}>{caption.length}/240</Text>
    <Text style={[styles.fieldLabel, { color: p.muted }]}>ADD A LITTLE TOPIC</Text><View style={styles.topics}>{topics.map((item) => <Chip key={item} label={item} active={topic === item} onPress={() => setTopic(item)} style={{ marginBottom: 7 }} />)}</View>
    <View style={[styles.privacy, { backgroundColor: p.surfaceAlt }]}><Text style={[styles.privacyIcon, { color: p.primary }]}>♡</Text><Text style={[styles.privacyText, { color: p.muted }]}>This preview stores your community post on this device. Public profiles and cloud sharing are not connected.</Text></View>
    <Button title={saving ? 'Saving your look…' : 'Add to the style edit'} icon="✳" onPress={publish} disabled={saving} style={{ marginTop: 14 }} />
  </Screen>;
}

const styles = StyleSheet.create({ screen: { paddingTop: 13 }, preview: { width: '100%', height: 335, borderRadius: 17 }, placeholder: { height: 250, borderWidth: 1, borderStyle: 'dashed', borderRadius: 17, alignItems: 'center', justifyContent: 'center' }, placeholderIcon: { fontSize: 29, marginBottom: 9 }, placeholderTitle: { fontSize: 14, fontWeight: '700' }, placeholderBody: { fontSize: 9, marginTop: 5 }, photoActions: { flexDirection: 'row', marginTop: 11, marginBottom: 18 }, fieldLabel: { fontSize: 8, fontWeight: '800', letterSpacing: 1.3, marginBottom: 8 }, captionInput: { minHeight: 90, borderWidth: 1, borderRadius: 12, padding: 12, textAlignVertical: 'top', fontSize: 11, lineHeight: 17 }, charCount: { fontSize: 8, alignSelf: 'flex-end', marginTop: 5, marginBottom: 17 }, topics: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 8 }, privacy: { flexDirection: 'row', padding: 11, borderRadius: 11, alignItems: 'center' }, privacyIcon: { fontSize: 17, marginRight: 9 }, privacyText: { flex: 1, fontSize: 8, lineHeight: 13 },
});
