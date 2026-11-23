import React, { useCallback, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { addAssistantMessage, getAssistantMessages, getWardrobe } from '../db/repository';
import { PageHeader, Screen } from '../components/UI';
import { getStyleSuggestion } from '../services/styleAssistantService';
import { useAuth } from '../context/AuthContext';
import { useAppTheme } from '../context/ThemeContext';

export default function AssistantScreen() {
  const db = useSQLiteContext(); const { session } = useAuth(); const { palette: p } = useAppTheme();
  const [messages, setMessages] = useState([]); const [draft, setDraft] = useState(''); const [busy, setBusy] = useState(false);
  const refresh = useCallback(async () => setMessages(await getAssistantMessages(db)), [db]);
  useFocusEffect(useCallback(() => { refresh(); }, [refresh]));
  const send = async (text = draft) => {
    const question = text.trim(); if (!question || busy) return;
    setDraft(''); setBusy(true); await addAssistantMessage(db, 'user', question); await refresh();
    try {
      const wardrobe = await getWardrobe(db);
      const wardrobeContext = wardrobe.map((item) => item.name).slice(0, 24).join(', ');
      const reply = await getStyleSuggestion(`${question} Wardrobe: ${wardrobeContext}`, session?.accessToken);
      await addAssistantMessage(db, 'assistant', reply); await refresh();
    } catch (error) {
      await addAssistantMessage(db, 'assistant', error.message || 'I could not find an idea right now. Try again in a moment.'); await refresh();
    } finally { setBusy(false); }
  };
  return <Screen scroll={false} contentStyle={styles.screen}>
    <PageHeader eyebrow="YOUR KIND STYLE GUIDE" title="Style notes" subtitle={session?.mode === 'jwt' ? 'Personal ideas for your real-life wardrobe.' : 'A sample style guide, ready to explore.'} onBack={() => router.back()} />
    <View style={[styles.notice, { backgroundColor: p.surfaceAlt }]}><Text style={{ color: p.primary, fontSize: 17, marginRight: 9 }}>✳</Text><Text style={[styles.noticeText, { color: p.muted }]}>{session?.mode === 'jwt' ? 'Suggestions connect to your configured style assistant.' : 'Demo suggestions are locally generated. Connect /style/assistant for your AI service.'}</Text></View>
    <ScrollView style={styles.feed} contentContainerStyle={styles.feedContent} showsVerticalScrollIndicator={false}>
      {!messages.length ? <View style={styles.welcome}><Text style={[styles.glyph, { color: p.primary }]}>✳</Text><Text style={[styles.welcomeTitle, { color: p.ink }]}>What are you getting dressed for?</Text><Text style={[styles.welcomeBody, { color: p.muted }]}>Tell me about your day, the weather or what you are reaching for. We’ll start with the pieces you already own.</Text><View style={styles.prompts}>{['Help me style a blazer', 'A rainy day outfit', 'What colours go together?'].map((prompt) => <Pressable key={prompt} onPress={() => send(prompt)} style={[styles.prompt, { borderColor: p.border, backgroundColor: p.surface }]}><Text style={{ color: p.primary, fontSize: 10 }}>{prompt}  →</Text></Pressable>)}</View></View> : messages.map((message) => <View key={message.id} style={[styles.message, { alignSelf: message.role === 'user' ? 'flex-end' : 'flex-start', backgroundColor: message.role === 'user' ? p.primary : p.surface, borderColor: p.border }]}><Text style={{ color: message.role === 'user' ? 'white' : p.ink, fontSize: 11, lineHeight: 17 }}>{message.body}</Text></View>)}
      {busy ? <Text style={{ color: p.muted, padding: 10, fontSize: 10 }}>Putting an idea together…</Text> : null}
    </ScrollView>
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}><View style={[styles.composer, { backgroundColor: p.surface, borderColor: p.border }]}><TextInput value={draft} onChangeText={setDraft} placeholder="Ask your style guide..." placeholderTextColor={p.muted} style={[styles.input, { color: p.ink }]} onSubmitEditing={() => send()} returnKeyType="send" /><Pressable onPress={() => send()} style={[styles.send, { backgroundColor: p.primary }]}><Text style={{ color: 'white', fontWeight: '700' }}>↑</Text></Pressable></View></KeyboardAvoidingView>
  </Screen>;
}
const styles = StyleSheet.create({ screen: { paddingTop: 12, flex: 1 }, notice: { flexDirection: 'row', alignItems: 'center', borderRadius: 12, padding: 11, marginBottom: 10 }, noticeText: { fontSize: 9, lineHeight: 13, flex: 1 }, feed: { flex: 1 }, feedContent: { flexGrow: 1, justifyContent: 'flex-end', paddingBottom: 12 }, welcome: { alignItems: 'center', justifyContent: 'center', flex: 1, paddingHorizontal: 15 }, glyph: { fontSize: 34 }, welcomeTitle: { fontSize: 18, fontWeight: '700', textAlign: 'center', marginTop: 10 }, welcomeBody: { fontSize: 10, lineHeight: 16, textAlign: 'center', marginTop: 8 }, prompts: { width: '100%', marginTop: 13 }, prompt: { padding: 11, borderWidth: 1, borderRadius: 11, marginTop: 7 }, message: { maxWidth: '90%', borderRadius: 15, padding: 12, borderWidth: 1, marginVertical: 5 }, composer: { flexDirection: 'row', alignItems: 'center', minHeight: 50, borderWidth: 1, borderRadius: 14, paddingHorizontal: 8, marginTop: 8, marginBottom: 8 }, input: { flex: 1, fontSize: 11, paddingHorizontal: 9 }, send: { width: 34, height: 34, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
});
