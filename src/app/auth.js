import React, { useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { useAppTheme } from '../context/ThemeContext';

export default function AuthScreen() {
  const { palette: p } = useAppTheme();
  const { login, register } = useAuth();
  const [mode, setMode] = useState('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const submit = async () => {
    if (!email.trim() || !password.trim() || (mode === 'register' && !name.trim())) { setError('Fill in the details to continue.'); return; }
    setBusy(true); setError('');
    try {
      if (mode === 'register') await register({ name, email: email.trim(), password });
      else await login({ email: email.trim(), password });
      router.replace('/(tabs)');
    } catch (exception) { setError(exception.message || 'Could not connect.'); } finally { setBusy(false); }
  };
  return <SafeAreaView style={[styles.safe, { backgroundColor: p.background }]}><KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
    <View style={[styles.art, { backgroundColor: p.surfaceAlt }]}><Text style={[styles.brand, { color: p.primary }]}>zenvy</Text><Text style={[styles.artGlyph, { color: p.primary }]}>✳</Text><Text style={[styles.quote, { color: p.ink }]}>Style that feels
like you.</Text><Text style={[styles.caption, { color: p.muted }]}>A softer place for your everyday style.</Text></View>
    <View style={styles.form}><Text style={[styles.title, { color: p.ink }]}>{mode === 'login' ? 'Welcome back' : 'Make yourself at home'}</Text><Text style={[styles.sub, { color: p.muted }]}>Your closet, community and little ideas, all in one place.</Text>
      {mode === 'register' ? <Input placeholder="Your name" value={name} onChangeText={setName} palette={p} /> : null}
      <Input placeholder="Email address" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" palette={p} />
      <Input placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry palette={p} />
      {error ? <Text style={{ color: '#AB4F43', fontSize: 12, marginBottom: 8 }}>{error}</Text> : null}
      <Pressable onPress={submit} disabled={busy} style={[styles.submit, { backgroundColor: p.primary }]}>{busy ? <ActivityIndicator color="white" /> : <Text style={styles.submitText}>{mode === 'login' ? 'Sign in' : 'Create account'}</Text>}</Pressable>
      <Pressable onPress={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); }} style={styles.switch}><Text style={{ color: p.muted }}>{mode === 'login' ? 'New to Zenvy? ' : 'Already have an account? '}<Text style={{ color: p.primary, fontWeight: '700' }}>{mode === 'login' ? 'Create an account' : 'Sign in'}</Text></Text></Pressable>
      <Text style={[styles.demo, { color: p.muted }]}>DEMO MODE  ·  API CONNECTION OPTIONAL
Sign in or register with any email and password to explore locally. For JWT accounts, configure EXPO_PUBLIC_API_URL.</Text>
    </View>
  </KeyboardAvoidingView></SafeAreaView>;
}

function Input(props) {
  const { palette: p, ...inputProps } = props;
  return <TextInput placeholderTextColor={p.muted} style={[styles.input, { backgroundColor: p.surface, borderColor: p.border, color: p.ink }]} {...inputProps} />;
}
const styles = StyleSheet.create({
  safe: { flex: 1 }, container: { flex: 1 }, art: { flex: 0.9, minHeight: 245, paddingHorizontal: 28, paddingTop: 28, justifyContent: 'center', overflow: 'hidden' }, brand: { fontSize: 28, fontWeight: '700', letterSpacing: -1.5 }, artGlyph: { position: 'absolute', right: 27, top: 27, fontSize: 90, opacity: 0.3 }, quote: { fontSize: 42, fontWeight: '600', letterSpacing: -1.9, lineHeight: 45, marginTop: 26 }, caption: { fontSize: 12, marginTop: 9 }, form: { flex: 1.1, padding: 24, justifyContent: 'center' }, title: { fontSize: 26, fontWeight: '700', letterSpacing: -0.8 }, sub: { fontSize: 12, lineHeight: 18, marginTop: 7, marginBottom: 20 }, input: { height: 50, borderWidth: 1, borderRadius: 13, paddingHorizontal: 14, fontSize: 13, marginBottom: 10 }, submit: { minHeight: 50, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginTop: 3 }, submitText: { color: 'white', fontWeight: '700' }, switch: { alignItems: 'center', padding: 17 }, demo: { textAlign: 'center', fontSize: 9, lineHeight: 15, letterSpacing: 0.2, marginTop: 2 },
});
