import React, { useCallback, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { router, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { Avatar, Button, Card, PageHeader, Photo, Screen, SectionTitle } from '../../components/UI';
import { getCreatorOutfits, isFollowing, toggleFollowing } from '../../db/repository';
import { fetchRemoteFollowing, fetchRemoteOutfitHistory, updateRemoteFollow } from '../../services/communityService';
import { useAuth } from '../../context/AuthContext';
import { useAppTheme } from '../../context/ThemeContext';

const people = {
  'mila.wears': { name: 'Mila Chen', city: 'London', bio: 'Soft layers, favourite repeats and taking the scenic route.' },
  'lena.in.colour': { name: 'Lena Ortiz', city: 'Brooklyn', bio: 'Finding the colour in everyday things.' },
  'atelier.mai': { name: 'Mai Laurent', city: 'Paris', bio: 'A little atelier of outfits I love to wear again.' },
  'sunday.with.sana': { name: 'Sana Ali', city: 'London', bio: 'Vintage denim and nowhere urgent to be.' },
};
export default function MemberScreen() {
  const { id } = useLocalSearchParams();
  const creatorId = Array.isArray(id) ? id[0] : id;
  const db = useSQLiteContext();
  const { session } = useAuth();
  const { palette: p } = useAppTheme();
  const person = people[creatorId] || { name: creatorId, city: 'Zenvy community', bio: 'Sharing outfits and everyday inspiration.' };
  const [following, setFollowing] = useState(false);
  const [outfits, setOutfits] = useState([]);
  const refresh = useCallback(async () => {
    const [status, localHistory] = await Promise.all([isFollowing(db, creatorId), getCreatorOutfits(db, creatorId)]);
    try {
      const [remote, remoteFollows] = await Promise.all([fetchRemoteOutfitHistory(creatorId, session?.accessToken), fetchRemoteFollowing(session?.accessToken)]);
      setOutfits(remote || localHistory);
      setFollowing(remoteFollows ? remoteFollows.some((item) => item.creator_id === creatorId) : status);
    } catch { setFollowing(status); setOutfits(localHistory); }
  }, [db, creatorId, session]);
  useFocusEffect(useCallback(() => { refresh(); }, [refresh]));
  const follow = async () => {
    const next = !following;
    await toggleFollowing(db, creatorId, person.name);
    setFollowing(next);
    try { await updateRemoteFollow(creatorId, next, session?.accessToken); } catch (error) { if (session?.mode === 'jwt') Alert.alert('Saved on this phone', error.message); }
  };
  return <Screen contentStyle={styles.screen}>
    <PageHeader eyebrow="COMMUNITY PROFILE" title={person.name} subtitle={`@${creatorId}  Â·  ${person.city}`} onBack={() => router.back()} />
    <Card style={styles.profile}><View style={styles.personRow}><Avatar name={person.name} size={58} /><View style={{ flex: 1, marginLeft: 13 }}><Text style={[styles.name, { color: p.ink }]}>{person.name}</Text><Text style={[styles.handle, { color: p.muted }]}>@{creatorId} Â· {person.city}</Text></View><Text style={{ color: p.primary, fontSize: 22 }}>âœ³</Text></View><Text style={[styles.bio, { color: p.muted }]}>{person.bio}</Text><View style={styles.buttons}><Button title={following ? 'Following' : 'Follow style'} icon={following ? 'âœ“' : '+'} onPress={follow} style={{ flex: 1 }} /><Button title="Message" variant="secondary" icon="â—Œ" onPress={() => router.push('/chat')} style={{ flex: 1, marginLeft: 8 }} /></View></Card>
    <SectionTitle title="Seven days of outfits" />
    <Text style={[styles.intro, { color: p.muted }]}>A little outfit diary. Save ideas, try a repeat, make it your own.</Text>
    {outfits.map((outfit) => <Card key={outfit.id || outfit.worn_on} style={styles.outfit}><Photo uri={outfit.image_uri || outfit.image} style={styles.image} /><View style={styles.outfitCopy}><Text style={[styles.date, { color: p.primary }]}>{new Date(outfit.worn_on || outfit.date).toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' }).toUpperCase()}</Text><Text style={[styles.outfitTitle, { color: p.ink }]}>{outfit.outfit_title || outfit.title}</Text><Text style={[styles.caption, { color: p.muted }]}>{outfit.caption || outfit.description}</Text></View></Card>)}
    {!outfits.length ? <Card><Text style={{ color: p.muted }}>No outfit diary entries yet.</Text></Card> : null}
    <Text style={[styles.sampleNote, { color: p.muted }]}>Sample community profile Â· histories are seeded for product preview.</Text>
  </Screen>;
}
const styles = StyleSheet.create({ screen: { paddingTop: 12 }, profile: { padding: 16 }, personRow: { flexDirection: 'row', alignItems: 'center' }, name: { fontSize: 19, fontWeight: '700' }, handle: { fontSize: 9, marginTop: 4 }, bio: { fontSize: 11, lineHeight: 17, marginTop: 15 }, buttons: { flexDirection: 'row', marginTop: 15 }, intro: { fontSize: 10, lineHeight: 15, marginTop: -7, marginBottom: 12 }, outfit: { flexDirection: 'row', padding: 8, marginBottom: 10 }, image: { width: 100, height: 128, borderRadius: 12 }, outfitCopy: { flex: 1, padding: 9, justifyContent: 'center' }, date: { fontSize: 7, fontWeight: '800', letterSpacing: 1 }, outfitTitle: { fontSize: 14, fontWeight: '700', marginTop: 7 }, caption: { fontSize: 9, lineHeight: 14, marginTop: 5 }, sampleNote: { fontSize: 8, textAlign: 'center', marginVertical: 10 },
});

