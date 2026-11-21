import React, { useCallback, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { Button, PageHeader, Photo, Screen } from '../../components/UI';
import { getArticle, toggleArticleBookmark } from '../../db/repository';
import { useAppTheme } from '../../context/ThemeContext';

export default function ArticleScreen() {
  const { id } = useLocalSearchParams();
  const db = useSQLiteContext();
  const { palette: p } = useAppTheme();
  const [article, setArticle] = useState(null);
  const refresh = useCallback(() => { getArticle(db, Number(id)).then(setArticle).catch(() => {}); }, [db, id]);
  useFocusEffect(useCallback(() => { refresh(); }, [refresh]));
  if (!article) return <Screen><PageHeader title="A little note" onBack={() => router.back()} /><Text style={{ color: p.muted }}>Opening your story…</Text></Screen>;
  return <Screen contentStyle={styles.screen}>
    <PageHeader eyebrow="THE ZENVY JOURNAL" title={article.category} onBack={() => router.back()} />
    <Photo uri={article.image_uri} style={styles.cover} />
    <Text style={[styles.category, { color: p.primary }]}>{article.category}  ·  {article.read_minutes} MIN READ</Text>
    <Text style={[styles.title, { color: p.ink }]}>{article.title}</Text>
    <Text style={[styles.byline, { color: p.muted }]}>Words by {article.author}  ·  An editorial note from Zenvy</Text>
    <View style={[styles.rule, { backgroundColor: p.border }]} />
    <Text style={[styles.lede, { color: p.primary }]}>{article.excerpt}</Text>
    {article.body.split('\n\n').map((paragraph, index) => <Text key={index} style={[styles.body, { color: p.ink }]}>{paragraph}</Text>)}
    <Button title={article.bookmarked ? 'Remove from saved stories' : 'Save this story for later'} variant="secondary" icon={article.bookmarked ? '▣' : '♡'} onPress={async () => { await toggleArticleBookmark(db, article.id); await refresh(); }} style={{ marginTop: 18 }} />
    <View style={[styles.endMark, { borderColor: p.border }]}><Text style={[styles.endMarkText, { color: p.primary }]}>✳  A LITTLE SPACE FOR YOUR STYLE</Text></View>
  </Screen>;
}

const styles = StyleSheet.create({ screen: { paddingTop: 13 }, cover: { width: '100%', height: 310, borderRadius: 18, marginBottom: 19 }, category: { fontSize: 8, fontWeight: '800', letterSpacing: 1.3 }, title: { fontSize: 31, lineHeight: 36, fontWeight: '600', letterSpacing: -1, marginTop: 10 }, byline: { fontSize: 9, marginTop: 10 }, rule: { height: 1, marginVertical: 18 }, lede: { fontSize: 16, lineHeight: 24, fontWeight: '500', marginBottom: 12 }, body: { fontSize: 12, lineHeight: 21, marginBottom: 15 }, endMark: { borderTopWidth: 1, marginTop: 25, paddingTop: 19, alignItems: 'center' }, endMarkText: { fontSize: 8, fontWeight: '800', letterSpacing: 1.3 },
});
