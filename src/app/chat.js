import React, { useCallback, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { Card, PageHeader, Photo, Screen } from '../components/UI';
import { getConversations } from '../db/repository';
import { loadRemoteConversations } from '../services/chatService';
import { useAuth } from '../context/AuthContext';
import { useAppTheme } from '../context/ThemeContext';

export default function ChatListScreen() {
  const db = useSQLiteContext(); const { session } = useAuth(); const { palette: p } = useAppTheme();
  const [chats, setChats] = useState([]);
  const refresh = useCallback(async () => {
    const local = await getConversations(db);
    try { setChats((await loadRemoteConversations(session?.accessToken)) || local); } catch { setChats(local); }
  }, [db, session]);
  useFocusEffect(useCallback(() => { refresh(); }, [refresh]));
  return <Screen contentStyle={styles.screen}>
    <PageHeader eyebrow="YOUR COMMUNITY" title="Conversations" subtitle={session?.mode === 'jwt' ? 'Your Zenvy messages.' : 'A warm place to talk about the looks you love.'} onBack={() => router.back()} action="âœ³" onAction={() => router.push('/assistant')} />
    {chats.map((chat) => <Pressable key={chat.id} onPress={() => router.push(`/chat/${chat.id}`)}><Card style={styles.row}><Photo uri={chat.peer_avatar} style={styles.avatar} /><View style={{ flex: 1 }}><Text style={[styles.person, { color: p.ink }]}>{chat.peer_name}</Text><Text style={[styles.message, { color: p.muted }]} numberOfLines={1}>{chat.last_message}</Text></View><Text style={{ color: p.primary, fontSize: 17 }}>â€º</Text></Card></Pressable>)}
    <Text style={[styles.note, { color: p.muted }]}>Local preview conversations are stored on this phone. Configure the chat API to sync across accounts.</Text>
  </Screen>;
}
const styles = StyleSheet.create({ screen: { paddingTop: 12 }, row: { flexDirection: 'row', alignItems: 'center', padding: 11, marginBottom: 9 }, avatar: { width: 48, height: 48, borderRadius: 24, marginRight: 11 }, person: { fontSize: 12, fontWeight: '700' }, message: { fontSize: 9, marginTop: 4 }, note: { fontSize: 8, textAlign: 'center', lineHeight: 13, marginTop: 13 },
});

