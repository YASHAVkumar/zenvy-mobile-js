import React from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useAppTheme } from '../context/ThemeContext';

/** @type {import('react-native-safe-area-context').Edge[]} */
const DEFAULT_EDGES = ['top', 'left', 'right'];

export function Screen({ children, scroll = true, contentStyle = null, style = null, edges = DEFAULT_EDGES }) {
  const { palette: p } = useAppTheme();
  return (
    <SafeAreaView edges={edges} style={[styles.safe, { backgroundColor: p.background }, style]}>
      {scroll ? <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[styles.content, contentStyle]}>{children}</ScrollView> : children}
    </SafeAreaView>
  );
}

export function PageHeader({ eyebrow = '', title, subtitle = '', action = '◉', onAction = null, onBack = null }) {
  const { palette: p } = useAppTheme();
  return (
    <View style={styles.header}>
      <View style={styles.headerText}>
        {onBack ? <Pressable onPress={onBack} hitSlop={12}><Text style={[styles.back, { color: p.primary }]}>‹  BACK</Text></Pressable> : null}
        {eyebrow ? <Text style={[styles.eyebrow, { color: p.muted }]}>{eyebrow}</Text> : null}
        <Text style={[styles.pageTitle, { color: p.ink }]}>{title}</Text>
        {subtitle ? <Text style={[styles.subtitle, { color: p.muted }]}>{subtitle}</Text> : null}
      </View>
      {onAction ? <Pressable onPress={onAction} style={[styles.headerAction, { backgroundColor: p.surface, borderColor: p.border }]}><Text style={[styles.headerGlyph, { color: p.primary }]}>{action}</Text></Pressable> : null}
    </View>
  );
}

export function SectionTitle({ title, action = null, onPress = null, style = null }) {
  const { palette: p } = useAppTheme();
  return <View style={[styles.sectionHead, style]}><Text style={[styles.sectionTitle, { color: p.ink }]}>{title}</Text>{action ? <Pressable onPress={onPress} hitSlop={10}><Text style={[styles.sectionAction, { color: p.primary }]}>{action}  →</Text></Pressable> : null}</View>;
}

export function Button({ title, onPress, variant = 'primary', icon = null, style = null, disabled = false }) {
  const { palette: p } = useAppTheme();
  const light = variant !== 'primary';
  return (
    <Pressable disabled={disabled} onPress={onPress} style={({ pressed }) => [styles.button, { backgroundColor: light ? p.surfaceAlt : p.primary, borderColor: light ? p.border : p.primary, opacity: disabled ? 0.5 : pressed ? 0.84 : 1 }, style]}>
      {icon ? <Text style={[styles.buttonIcon, { color: light ? p.primary : '#FFFFFF' }]}>{icon}</Text> : null}
      <Text style={[styles.buttonText, { color: light ? p.primary : '#FFFFFF' }]}>{title}</Text>
    </Pressable>
  );
}

export function Chip({ label, active, onPress, style = null }) {
  const { palette: p } = useAppTheme();
  return <Pressable onPress={onPress} style={[styles.chip, { borderColor: active ? p.primary : p.border, backgroundColor: active ? p.primary : p.surface }, style]}><Text style={[styles.chipText, { color: active ? '#FFFFFF' : p.muted }]}>{label}</Text></Pressable>;
}

export function Card({ children, style = null, onPress = null }) {
  const { palette: p } = useAppTheme();
  const boxStyle = [styles.card, { backgroundColor: p.surface, borderColor: p.border }, style];
  return onPress ? <Pressable onPress={onPress} style={({ pressed }) => [...boxStyle, pressed && { opacity: 0.9 }]}>{children}</Pressable> : <View style={boxStyle}>{children}</View>;
}

/** @param {{ uri?: string, style: import('react-native').StyleProp<import('react-native').ImageStyle>, resizeMode?: import('react-native').ImageResizeMode }} props */
export function Photo({ uri, style, resizeMode = 'cover' }) {
  const { palette: p } = useAppTheme();
  const [failedUri, setFailedUri] = React.useState(null);
  if (!uri || uri === failedUri) return <View style={[styles.photoFallback, { backgroundColor: p.surfaceAlt }, style]}><Text style={{ color: p.muted, fontSize: 22 }}>✳</Text></View>;
  return <Image source={{ uri }} resizeMode={resizeMode} onError={() => setFailedUri(uri)} style={[{ backgroundColor: p.surfaceAlt }, style]} />;
}

export function Avatar({ name = 'Alex', size = 42 }) {
  const { palette: p } = useAppTheme();
  return <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: p.surfaceAlt, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: p.border }}><Text style={{ color: p.primary, fontWeight: '700', fontSize: size * 0.38 }}>{name.slice(0, 1).toUpperCase()}</Text></View>;
}

export function Metric({ value, label, accent = null }) {
  const { palette: p } = useAppTheme();
  return <View style={styles.metric}><Text style={[styles.metricValue, { color: accent || p.ink }]}>{value}</Text><Text style={[styles.metricLabel, { color: p.muted }]}>{label}</Text></View>;
}

export function EmptyState({ icon = '✳', title, body, action = null, onPress = null }) {
  const { palette: p } = useAppTheme();
  return <View style={[styles.empty, { backgroundColor: p.surface, borderColor: p.border }]}><Text style={[styles.emptyIcon, { color: p.primary }]}>{icon}</Text><Text style={[styles.emptyTitle, { color: p.ink }]}>{title}</Text><Text style={[styles.emptyBody, { color: p.muted }]}>{body}</Text>{action ? <Button title={action} onPress={onPress} style={{ marginTop: 16 }} /> : null}</View>;
}

export function MiniLink({ title, route, icon = '↗' }) {
  const { palette: p } = useAppTheme();
  return <Pressable onPress={() => router.push(route)} style={[styles.miniLink, { backgroundColor: p.surface, borderColor: p.border }]}><Text style={[styles.miniLinkIcon, { color: p.primary }]}>{icon}</Text><Text style={[styles.miniLinkTitle, { color: p.ink }]}>{title}</Text><Text style={[styles.miniLinkArrow, { color: p.muted }]}>→</Text></Pressable>;
}

export const uiStyles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center' },
  spread: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  small: { fontSize: 11 },
});

const styles = StyleSheet.create({
  safe: { flex: 1 }, content: { paddingHorizontal: 21, paddingTop: 16, paddingBottom: 30 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 21 }, headerText: { flex: 1 }, eyebrow: { fontSize: 9, fontWeight: '700', letterSpacing: 1.8, marginBottom: 7 }, pageTitle: { fontSize: 31, lineHeight: 37, letterSpacing: -1, fontWeight: '600' }, subtitle: { fontSize: 12, lineHeight: 18, marginTop: 5, maxWidth: 300 }, back: { fontSize: 9, fontWeight: '700', letterSpacing: 1.2, marginBottom: 12 }, headerAction: { width: 43, height: 43, borderRadius: 15, borderWidth: 1, alignItems: 'center', justifyContent: 'center', marginLeft: 12 }, headerGlyph: { fontSize: 20 },
  sectionHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 25, marginBottom: 13 }, sectionTitle: { fontSize: 18, fontWeight: '600', letterSpacing: -0.5 }, sectionAction: { fontSize: 10, fontWeight: '600' },
  button: { minHeight: 46, borderRadius: 13, borderWidth: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 17 }, buttonText: { fontSize: 12, fontWeight: '700', letterSpacing: 0.1 }, buttonIcon: { fontSize: 16, marginRight: 8 }, chip: { borderWidth: 1, paddingVertical: 9, paddingHorizontal: 15, borderRadius: 20, marginRight: 7 }, chipText: { fontSize: 10, fontWeight: '600' },
  card: { borderRadius: 17, borderWidth: 1, padding: 14, overflow: 'hidden' }, photoFallback: { justifyContent: 'center', alignItems: 'center' }, metric: { flex: 1, alignItems: 'center', justifyContent: 'center', minWidth: 76 }, metricValue: { fontSize: 20, fontWeight: '700', letterSpacing: -0.6 }, metricLabel: { fontSize: 9, marginTop: 5, textAlign: 'center' }, empty: { borderWidth: 1, borderRadius: 18, padding: 24, alignItems: 'center', marginVertical: 16 }, emptyIcon: { fontSize: 31, marginBottom: 9 }, emptyTitle: { fontSize: 15, fontWeight: '600', textAlign: 'center' }, emptyBody: { fontSize: 11, textAlign: 'center', lineHeight: 17, marginTop: 6 }, miniLink: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: 13, padding: 14, marginBottom: 9 }, miniLinkIcon: { fontSize: 18, width: 34 }, miniLinkTitle: { flex: 1, fontSize: 12, fontWeight: '600' }, miniLinkArrow: { fontSize: 16 },
});
