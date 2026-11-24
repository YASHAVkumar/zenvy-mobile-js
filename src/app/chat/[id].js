import React, { useCallback, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { router, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { PageHeader, Screen } from '../../components/UI';
import { getConversations, getMessages, sendLocalMessage } from '../../db/repository';
import { loadRemoteConversations, loadRemoteMessages, sendRemoteMessage } from '../../services/chatService';
import { useAuth } from '../../context/AuthContext';
import { useAppTheme } from '../../context/ThemeContext';

export default function ChatConversationScreen() {
  const { id } = useLocalSearchParams(); const conversationId = Array.isArray(id) ? id[0] : id;
  const db = useSQLiteContext(); const { session } = useAuth(); const { palette: p } = useAppTheme();
  const [peer, setPeer] = useState('A Zenvy friend'); const [messages, setMessages] = useState([]); const [draft, setDraft] = useState('');
  const refresh = useCallback(async () => {
    const [chats, local] = await Promise.all([getConversations(db), getMessages(db, conversationId)]);
    const localPeer = chats.find((item) => item.id === conversationId)?.peer_name || 'A Zenvy friend';
    setPeer(localPeer);
    try {
      const [remoteChats, remoteMessages] = await Promise.all([loadRemoteConversations(session?.accessToken), loadRemoteMessages(conversationId, session?.accessToken)]);
      setPeer(remoteChats?.find((item) => item.id === conversationId)?.peer_name || localPeer);
      setMessages(remoteMessages || local);
    } catch { setMessages(local); }
  }, [db, conversationId, session]);
  useFocusEffect(useCallback(() => { refresh(); }, [refresh]));
  const send = async () => {
    const body = draft.trim(); if (!body) return;
    setDraft('');
    if (session?.mode === 'jwt') {
      try { await sendRemoteMessage(conversationId, body, session.accessToken); await refresh(); }
      catch { setDraft(body); }
    } else { await sendLocalMessage(db, conversationId, body); await refresh(); }
  };
  return <Screen scroll={false} contentStyle={styles.screen}>
    <PageHeader eyebrow="A LITTLE NOTE" title={peer} onBack={() => router.back()} />
    <KeyboardAvoidingView style={styles.fill} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.messages}>{messages.map((message) => { const mine = message.sender === 'me' || message.sender === 'user'; return <View key={message.id || message.sent_at} style={[styles.bubble, { alignSelf: mine ? 'flex-end' : 'flex-start', backgroundColor: mine ? p.primary : p.surface, borderColor: p.border }]}><Text style={{ color: mine ? '#FFF' : p.ink, fontSize: 12, lineHeight: 17 }}>{message.body}</Text><Text style={{ color: mine ? '#DBE8D4' : p.muted, fontSize: 7, marginTop: 5 }}>{mine ? 'YOU' : peer.toUpperCase()}</Text></View>; })}</View>
      <View style={[styles.composer, { borderColor: p.border, backgroundColor: p.surface }]}><TextInput value={draft} onChangeText={setDraft} placeholder="Write a kind note..." placeholderTextColor={p.muted} style={[styles.input, { color: p.ink }]} /><Pressable onPress={send} style={[styles.send, { backgroundColor: p.primary }]}><Text style={{ color: '#FFF', fontWeight: '700' }}>↑</Text></Pressable></View>
    </KeyboardAvoidingView>
  </Screen>;
}
const styles = StyleSheet.create({ screen: { paddingTop: 12, flex: 1 }, fill: { flex: 1 }, messages: { flex: 1, justifyContent: 'flex-end', paddingVertical: 12 }, bubble: { maxWidth: '82%', borderWidth: 1, borderRadius: 17, padding: 12, marginVertical: 5 }, composer: { flexDirection: 'row', alignItems: 'center', minHeight: 52, borderWidth: 1, borderRadius: 15, paddingHorizontal: 9, marginBottom: 8 }, input: { flex: 1, fontSize: 12, paddingHorizontal: 8 }, send: { width: 35, height: 35, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
});
