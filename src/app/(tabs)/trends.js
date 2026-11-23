import React, { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { Chip, PageHeader, Photo, Screen } from '../../components/UI';
import { getCommunityPosts, getSavedPostIds, getFollowingOutfits, toggleCommunityLike, toggleSavedPost } from '../../db/repository';
import { trendSeed } from '../../data/mockContent';
import { useAppTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { fetchRemoteFollowingOutfits } from '../../services/communityService';

const filters = ['For you', 'Colour', 'Layering', 'Slow style', 'Community', 'Following'];

export default function TrendsScreen() {
  const db = useSQLiteContext();
  const { palette: p, trendLayout, setTrendLayout } = useAppTheme();
  const { session } = useAuth();
  const [filter, setFilter] = useState('For you');
  const [posts, setPosts] = useState([]);
  const [saved, setSaved] = useState(new Set());
  const [followingPosts, setFollowingPosts] = useState([]);

  const refresh = useCallback(async () => {
    const [postRows, savedIds, followingRows] = await Promise.all([getCommunityPosts(db), getSavedPostIds(db), getFollowingOutfits(db)]);
    setPosts(postRows); setSaved(savedIds);
    try { setFollowingPosts((await fetchRemoteFollowingOutfits(session?.accessToken)) || followingRows); }
    catch { setFollowingPosts(followingRows); }
  }, [db, session]);
  useFocusEffect(useCallback(() => { refresh(); }, [refresh]));

  const like = async (id) => { await toggleCommunityLike(db, id); await refresh(); };
  const savePost = async (id) => { await toggleSavedPost(db, id); await refresh(); };
  const visiblePosts = filter === 'Slow style' ? posts.filter((post) => post.category === 'REWEAR' || post.category === 'SLOW SUNDAY') : filter === 'Layering' ? posts.filter((post) => post.category === 'LAYERING') : filter === 'Colour' ? posts.filter((post) => post.category === 'COLOUR STORY') : filter === 'Following' ? [] : posts;
  const today = new Intl.DateTimeFormat(undefined, { weekday: 'long', month: 'long', day: 'numeric' }).format(new Date()).toUpperCase();

  return <Screen contentStyle={styles.screen}>
    <PageHeader eyebrow={`TODAYÃ¢â‚¬â„¢S EDIT  Ã‚Â·  ${today}`} title="The style edit" subtitle="Fresh ideas for a wardrobe that already feels like you." action="Ã¯Â¼â€¹" onAction={() => router.push('/share-look')} />
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>{filters.map((item) => <Chip key={item} label={item} active={filter === item} onPress={() => setFilter(item)} />)}</ScrollView>
    {filter === 'Following' ? followingPosts.map((outfit) => <Pressable key={outfit.id} onPress={() => router.push(`/member/${encodeURIComponent(outfit.creator_id)}`)} style={[styles.postCard, { backgroundColor: p.surface, borderColor: p.border }]}><Photo uri={outfit.image_uri} style={styles.postPhoto} /><View style={{ padding: 12 }}><Text style={[styles.postHandle, { color: p.ink }]}>{outfit.display_name}  Ã‚Â·  {outfit.outfit_title}</Text><Text style={[styles.postLocation, { color: p.muted }]}>{outfit.worn_on}  Ã‚Â·  {outfit.location}</Text><Text style={[styles.postCaption, { color: p.ink, paddingHorizontal: 0 }]}>{outfit.caption}</Text></View></Pressable>) : null}
    <View style={styles.layoutRow}><Text style={[styles.trendCount, { color: p.muted }]}>TRENDING THIS WEEK  Ã‚Â·  {trendSeed.length} NOTES</Text><View style={[styles.toggleGroup, { backgroundColor: p.surfaceAlt }]}>{['mosaic', 'list'].map((mode) => <Pressable key={mode} onPress={() => setTrendLayout(mode)} style={[styles.toggle, trendLayout === mode && { backgroundColor: p.primary }]}><Text style={{ color: trendLayout === mode ? '#FFF' : p.muted, fontSize: 12 }}>{mode === 'mosaic' ? 'Ã¢â€“Â¦' : 'Ã¢ËœÂ°'}</Text></Pressable>)}</View></View>
    {trendLayout === 'mosaic' ? <View style={styles.trendGrid}>{trendSeed.filter((item) => filter === 'For you' || filter === 'Community' || filter === 'Slow style' || item.category.toLowerCase().includes(filter.toLowerCase())).map((trend, index) => <TrendCard key={trend.id} trend={trend} palette={p} style={index === 0 ? styles.tallTrend : null} onPress={() => setFilter('Community')} />)}</View> : <View style={styles.editorialList}>{trendSeed.filter((item) => filter === 'For you' || filter === 'Community' || filter === 'Slow style' || item.category.toLowerCase().includes(filter.toLowerCase())).map((trend) => <TrendListItem key={trend.id} trend={trend} palette={p} />)}</View>}
    <View style={[styles.communityHead, { borderColor: p.border }]}><View><Text style={[styles.communityEyebrow, { color: p.primary }]}>THE ZENVY COMMUNITY</Text><Text style={[styles.communityTitle, { color: p.ink }]}>People wearing life well</Text></View><Pressable onPress={() => router.push('/share-look')} style={[styles.shareButton, { backgroundColor: p.surfaceAlt }]}><Text style={[styles.shareButtonText, { color: p.primary }]}>Ã¯Â¼â€¹  Share a look</Text></Pressable></View>
    {filter !== 'Following' ? visiblePosts.map((post) => <CommunityPost key={post.id} post={post} saved={saved.has(post.id)} onLike={() => like(post.id)} onSave={() => savePost(post.id)} palette={p} />) : null}
    <View style={[styles.sampleNote, { backgroundColor: p.surfaceAlt }]}><Text style={[styles.sampleDot, { color: p.primary }]}>Ã¢Å“Â³</Text><Text style={[styles.sampleText, { color: p.muted }]}>Community profiles and outfit inspiration are sample content for this preview.</Text></View>
  </Screen>;
}

function TrendCard({ trend, palette: p, style, onPress }) {
  return <Pressable onPress={onPress} style={[styles.trendCard, { backgroundColor: p.surfaceAlt }, style]}><Photo uri={trend.image} style={StyleSheet.absoluteFill} /><View style={styles.trendShade} /><View style={styles.trendCopy}><Text style={styles.trendCategory}>{trend.category}</Text><Text style={styles.trendName}>{trend.title}</Text><Text numberOfLines={2} style={styles.trendDesc}>{trend.descriptor}</Text></View></Pressable>;
}

function TrendListItem({ trend, palette: p }) {
  return <View style={[styles.trendListItem, { borderColor: p.border, backgroundColor: p.surface }]}><Photo uri={trend.image} style={styles.listPhoto} /><View style={styles.listCopy}><Text style={[styles.trendListCategory, { color: p.primary }]}>{trend.category}</Text><Text style={[styles.trendListName, { color: p.ink }]}>{trend.title}</Text><Text style={[styles.trendListDesc, { color: p.muted }]}>{trend.descriptor}</Text></View><Text style={{ color: p.primary, fontSize: 17 }}>Ã¢â€ â€™</Text></View>;
}

function CommunityPost({ post, saved, onLike, onSave, palette: p }) {
  return <View style={[styles.postCard, { backgroundColor: p.surface, borderColor: p.border }]}><Pressable onPress={() => router.push(`/member/${encodeURIComponent(post.creator)}`)} style={styles.postHeader}><View style={[styles.postAvatar, { backgroundColor: p.surfaceAlt }]}><Text style={{ color: p.primary, fontWeight: '800' }}>{post.handle.slice(0, 1)}</Text></View><View style={{ flex: 1 }}><Text style={[styles.postHandle, { color: p.ink }]}>{post.handle}</Text><Text style={[styles.postLocation, { color: p.muted }]}>{post.creator}  Ã‚Â·  {post.location}</Text></View><Text style={[styles.postCategory, { color: p.primary }]}>{post.category}</Text></Pressable><Photo uri={post.image_uri} style={styles.postPhoto} /><Text style={[styles.postCaption, { color: p.ink }]}>{post.caption}</Text><View style={styles.postActions}><Pressable onPress={onLike} style={styles.postAction}><Text style={{ fontSize: 16, color: post.liked ? '#C76760' : p.muted }}>{post.liked ? 'Ã¢â„¢Â¥' : 'Ã¢â„¢Â¡'}</Text><Text style={[styles.actionCount, { color: p.muted }]}>{post.likes}</Text></Pressable><Pressable onPress={onSave} style={styles.postAction}><Text style={{ fontSize: 15, color: saved ? p.primary : p.muted }}>{saved ? 'Ã¢â€“Â£' : 'Ã¢â€“Â¢'}</Text><Text style={[styles.actionCount, { color: p.muted }]}>{saved ? 'Saved' : 'Save look'}</Text></Pressable><Text style={[styles.postAction, { marginLeft: 'auto', color: p.muted, fontSize: 11 }]}>Ã¢â€ â€”  Send a little love</Text></View></View>;
}

const styles = StyleSheet.create({ screen: { paddingTop: 13 }, filterRow: { paddingVertical: 2, paddingBottom: 17 }, layoutRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }, trendCount: { fontSize: 8, letterSpacing: 1, fontWeight: '800' }, toggleGroup: { flexDirection: 'row', borderRadius: 9, padding: 3 }, toggle: { width: 28, height: 25, borderRadius: 6, alignItems: 'center', justifyContent: 'center' }, trendGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }, trendCard: { width: '48.5%', height: 188, borderRadius: 16, overflow: 'hidden', marginBottom: 10, justifyContent: 'flex-end' }, tallTrend: { width: '100%', height: 242 }, trendShade: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(20,26,21,.24)' }, trendCopy: { padding: 12 }, trendCategory: { color: '#E4EEA8', fontSize: 7, letterSpacing: 1.4, fontWeight: '800' }, trendName: { color: '#FFFFFF', fontSize: 18, fontWeight: '600', marginTop: 5, letterSpacing: -0.4 }, trendDesc: { color: 'rgba(255,255,255,.88)', fontSize: 9, lineHeight: 14, marginTop: 5 }, editorialList: { marginBottom: 11 }, trendListItem: { flexDirection: 'row', alignItems: 'center', padding: 8, borderWidth: 1, borderRadius: 14, marginBottom: 8 }, listPhoto: { width: 70, height: 78, borderRadius: 10, marginRight: 11 }, listCopy: { flex: 1, paddingRight: 6 }, trendListCategory: { fontSize: 7, fontWeight: '800', letterSpacing: 1 }, trendListName: { fontSize: 13, fontWeight: '700', marginTop: 5 }, trendListDesc: { fontSize: 9, lineHeight: 14, marginTop: 4 }, communityHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, paddingTop: 19, marginTop: 8, marginBottom: 13 }, communityEyebrow: { fontSize: 7, fontWeight: '800', letterSpacing: 1.1 }, communityTitle: { fontSize: 16, fontWeight: '700', marginTop: 5 }, shareButton: { borderRadius: 9, paddingVertical: 9, paddingHorizontal: 10 }, shareButtonText: { fontSize: 9, fontWeight: '700' }, postCard: { borderWidth: 1, borderRadius: 16, overflow: 'hidden', marginBottom: 13 }, postHeader: { flexDirection: 'row', alignItems: 'center', padding: 11 }, postAvatar: { width: 35, height: 35, borderRadius: 18, justifyContent: 'center', alignItems: 'center', marginRight: 9 }, postHandle: { fontSize: 10, fontWeight: '700' }, postLocation: { fontSize: 8, marginTop: 3 }, postCategory: { fontSize: 7, fontWeight: '800', letterSpacing: 0.6 }, postPhoto: { width: '100%', height: 340 }, postCaption: { paddingHorizontal: 12, paddingTop: 11, fontSize: 10, lineHeight: 16 }, postActions: { flexDirection: 'row', alignItems: 'center', padding: 12 }, postAction: { flexDirection: 'row', alignItems: 'center', marginRight: 18 }, actionCount: { fontSize: 9, marginLeft: 5 }, sampleNote: { flexDirection: 'row', alignItems: 'center', padding: 11, borderRadius: 11, marginTop: 1, marginBottom: 16 }, sampleDot: { fontSize: 15, marginRight: 8 }, sampleText: { flex: 1, fontSize: 8, lineHeight: 12 },
});
