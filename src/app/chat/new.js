import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { Card, PageHeader, Photo, Screen } from '../../components/UI';
import { getConversations } from '../../db/repository';
import { searchRemoteUsers, startRemoteConversation } from '../../services/chatService';
import { useAuth } from '../../context/AuthContext';
import { useAppTheme } from '../../context/ThemeContext';

export default function NewConversationScreen() {
  const db = useSQLiteContext(); const { session } = useAuth(); const { palette: p } = useAppTheme();
  const [query, setQuery] = useState(''); const [people, setPeople] = useState([]); const [resultQuery, setResultQuery] = useState(''); const [busy, setBusy] = useState(false);
  useEffect(() => {
    let active = true;
    if (session?.mode !== 'jwt') {
      getConversations(db).then((rows) => { if (active) { setPeople(rows.map((row) => ({ id: row.id, name: row.peer_name, avatar: row.peer_avatar }))); setResultQuery(''); } });
      return () => { active = false; };
    }
    if (query.trim().length < 2) return () => { active = false; };
    const search = query.trim();
    const timer = setTimeout(() => {
      if (!active) return;
      setBusy(true);
      searchRemoteUsers(search, session.accessToken)
        .then((rows) => { if (active) { setPeople(rows); setResultQuery(search); } })
        .catch(() => { if (active) { setPeople([]); setResultQuery(search); } })
        .finally(() => { if (active) setBusy(false); });
    }, 250);
    return () => { active = false; clearTimeout(timer); };
  }, [db, query, session]);
  const open = async (person) => {
    try {
      if (session?.mode === 'jwt') {
        const conversation = await startRemoteConversation(person.id, session.accessToken);
        if (conversation) { router.replace(`/chat/${encodeURIComponent(conversation.id)}`); return; }
      }
      router.replace(`/chat/${encodeURIComponent(person.id)}`);
    } catch (error) { setBusy(false); Alert.alert('Conversation', error.message || 'Could not start this conversation.'); }
  };
  const visiblePeople = session?.mode === 'jwt'
    ? (resultQuery === query.trim() ? people : [])
    : people.filter((person) => !query || person.name.toLowerCase().includes(query.toLowerCase()));
  return <Screen contentStyle={styles.screen}>
    <PageHeader eyebrow="SAY HELLO" title="New conversation" subtitle={session?.mode === 'jwt' ? 'Find someone in the Zenvy community.' : 'Explore a few friendly sample conversations.'} onBack={() => router.back()} />
    <View style={[styles.search, { backgroundColor: p.surface, borderColor: p.border }]}><Text style={{ color: p.primary, fontSize: 17, marginRight: 8 }}>⌕</Text><TextInput value={query} onChangeText={setQuery} placeholder={session?.mode === 'jwt' ? 'Search members by name' : 'Find a style friend'} placeholderTextColor={p.muted} style={[styles.input, { color: p.ink }]} autoCapitalize="none" />{busy && session?.mode === 'jwt' && query.trim().length >= 2 ? <ActivityIndicator color={p.primary} /> : null}</View>
    {session?.mode === 'jwt' && query.trim().length < 2 ? <Text style={[styles.hint, { color: p.muted }]}>Enter at least two letters to find people.</Text> : null}
    {visiblePeople.map((person) => <Pressable key={person.id} onPress={() => open(person)}><Card style={styles.person}><Photo uri={person.avatar || person.peer_avatar} style={styles.avatar} /><View style={{ flex: 1 }}><Text style={[styles.name, { color: p.ink }]}>{person.name || person.peer_name}</Text><Text style={[styles.handle, { color: p.muted }]}>{session?.mode === 'jwt' ? 'Zenvy member' : 'Community style friend'}</Text></View><Text style={{ color: p.primary, fontSize: 18 }}>›</Text></Card></Pressable>)}
    {session?.mode === 'jwt' && query.trim().length >= 2 && resultQuery === query.trim() && !busy && !people.length ? <Text style={[styles.hint, { color: p.muted }]}>No members found for that name.</Text> : null}
  </Screen>;
}
const styles = StyleSheet.create({ screen: { paddingTop: 12 }, search: { minHeight: 49, borderRadius: 13, borderWidth: 1, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, marginBottom: 11 }, input: { flex: 1, fontSize: 11, paddingVertical: 9 }, person: { flexDirection: 'row', alignItems: 'center', padding: 10, marginBottom: 8 }, avatar: { width: 43, height: 43, borderRadius: 14, marginRight: 10 }, name: { fontSize: 11, fontWeight: '700' }, handle: { fontSize: 8, marginTop: 4 }, hint: { fontSize: 9, lineHeight: 14, textAlign: 'center', marginTop: 13 } });

