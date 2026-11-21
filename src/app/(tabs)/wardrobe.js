import React, { useCallback, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { router, useFocusEffect } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { Button, Chip, PageHeader, Photo, Screen, SectionTitle } from '../../components/UI';
import { getWardrobe, toggleWardrobeFavorite } from '../../db/repository';
import { useAppTheme } from '../../context/ThemeContext';

const categories = ['All', 'Tops', 'Knitwear', 'Bottoms', 'Dresses', 'Outerwear', 'Shoes', 'Accessories'];

export default function WardrobeScreen() {
  const db = useSQLiteContext();
  const { palette: p } = useAppTheme();
  const [items, setItems] = useState([]);
  const [category, setCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [favoriteOnly, setFavoriteOnly] = useState(false);
  const [layout, setLayout] = useState('grid');
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try { setItems(await getWardrobe(db, { category, search, favoriteOnly })); }
    catch { Alert.alert('Closet unavailable', 'Your wardrobe could not be loaded. Please try again.'); }
    finally { setLoading(false); }
  }, [db, category, search, favoriteOnly]);
  useFocusEffect(useCallback(() => { refresh(); }, [refresh]));

  const pickFromGallery = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsEditing: true, aspect: [4, 5], quality: 0.9 });
    if (!result.canceled) router.push({ pathname: '/new-item', params: { photoUri: result.assets[0].uri } });
  };
  const favorite = async (id) => { await toggleWardrobeFavorite(db, id); await refresh(); };

  return <Screen contentStyle={styles.screen}>
    <PageHeader eyebrow="YOUR PERSONAL EDIT" title="The closet" subtitle="Everything you own. All the things you love." action="＋" onAction={() => router.push('/new-item')} />
    <View style={[styles.searchBox, { backgroundColor: p.surface, borderColor: p.border }]}><Text style={[styles.searchIcon, { color: p.muted }]}>⌕</Text><TextInput value={search} onChangeText={setSearch} placeholder="Find something lovely…" placeholderTextColor={p.muted} style={[styles.searchInput, { color: p.ink }]} clearButtonMode="while-editing" /><Pressable onPress={pickFromGallery} style={[styles.galleryButton, { backgroundColor: p.surfaceAlt }]}><Text style={[styles.galleryGlyph, { color: p.primary }]}>▧</Text></Pressable></View>
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryRow}>{categories.map((item) => <Chip key={item} label={item} active={category === item} onPress={() => setCategory(item)} />)}</ScrollView>
    <View style={styles.toolbar}><Pressable onPress={() => setFavoriteOnly(!favoriteOnly)} style={[styles.favoriteFilter, { borderColor: favoriteOnly ? p.primary : p.border, backgroundColor: favoriteOnly ? p.surfaceAlt : p.surface }]}><Text style={{ color: favoriteOnly ? p.primary : p.muted, fontSize: 10 }}>♥  Favourites</Text></Pressable><View style={styles.layoutToggle}>{['grid', 'list'].map((mode) => <Pressable key={mode} onPress={() => setLayout(mode)} style={[styles.layoutButton, { backgroundColor: layout === mode ? p.primary : 'transparent' }]}><Text style={{ color: layout === mode ? '#FFF' : p.muted, fontSize: 12 }}>{mode === 'grid' ? '▦' : '☰'}</Text></Pressable>)}</View><Text style={[styles.pieceCount, { color: p.muted }]}>{items.length} PIECES</Text></View>
    {loading ? <Text style={[styles.emptyText, { color: p.muted }]}>Opening your closet…</Text> : items.length === 0 ? <View style={[styles.emptyState, { borderColor: p.border, backgroundColor: p.surface }]}><Text style={[styles.emptyGlyph, { color: p.primary }]}>▦</Text><Text style={[styles.emptyTitle, { color: p.ink }]}>Nothing on this rail</Text><Text style={[styles.emptyText, { color: p.muted }]}>Try another filter or add a new piece to your closet.</Text><Button title="Add a piece" icon="＋" onPress={() => router.push('/new-item')} style={{ marginTop: 15 }} /></View> : <View style={[styles.items, layout === 'list' && styles.itemsList]}>{items.map((item) => <WardrobeCard key={item.id} item={item} layout={layout} favorite={() => favorite(item.id)} open={() => router.push(`/item/${item.id}`)} palette={p} />)}</View>}
    <SectionTitle title="Make your wardrobe work harder" style={{ marginTop: 18 }} />
    <View style={[styles.careCard, { backgroundColor: p.surfaceAlt }]}><Text style={[styles.careIcon, { color: p.primary }]}>✳</Text><View style={{ flex: 1 }}><Text style={[styles.careTitle, { color: p.ink }]}>A little care goes a long way</Text><Text style={[styles.careBody, { color: p.muted }]}>Track what you wear, rediscover what you own, and find new combinations.</Text></View><Text style={[styles.careArrow, { color: p.primary }]}>→</Text></View>
  </Screen>;
}

function WardrobeCard({ item, layout, favorite, open, palette: p }) {
  return <Pressable onPress={open} style={[styles.itemCard, layout === 'list' && styles.itemCardList, { backgroundColor: p.surface, borderColor: p.border }]}>
    <Photo uri={item.image_uri} style={[styles.itemImage, layout === 'list' && styles.itemImageList]} />
    <View style={[styles.itemDetails, layout === 'list' && styles.itemDetailsList]}><Text style={[styles.categoryLabel, { color: p.primary }]}>{item.category.toUpperCase()} · {item.season.toUpperCase()}</Text><Text numberOfLines={1} style={[styles.itemName, { color: p.ink }]}>{item.name}</Text><Text style={[styles.itemSub, { color: p.muted }]}>{item.color}  ·  Worn {item.wears} times</Text></View>
    <Pressable accessibilityRole="button" accessibilityLabel={item.favorite ? 'Remove favorite' : 'Add favorite'} onPress={(event) => { event.stopPropagation(); favorite(); }} style={[styles.heart, { backgroundColor: p.background }]}><Text style={{ color: item.favorite ? '#BB6E5A' : p.muted, fontSize: 15 }}>{item.favorite ? '♥' : '♡'}</Text></Pressable>
  </Pressable>;
}

const styles = StyleSheet.create({ screen: { paddingTop: 13 }, searchBox: { height: 47, borderWidth: 1, borderRadius: 13, flexDirection: 'row', alignItems: 'center', paddingLeft: 12, paddingRight: 5 }, searchIcon: { fontSize: 23, marginRight: 7 }, searchInput: { flex: 1, fontSize: 11, paddingVertical: 8 }, galleryButton: { width: 35, height: 35, borderRadius: 10, alignItems: 'center', justifyContent: 'center' }, galleryGlyph: { fontSize: 17 }, categoryRow: { paddingVertical: 14, paddingRight: 7 }, toolbar: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 }, favoriteFilter: { borderWidth: 1, borderRadius: 17, paddingVertical: 7, paddingHorizontal: 10 }, layoutToggle: { flexDirection: 'row', backgroundColor: '#00000009', borderRadius: 9, padding: 3, marginLeft: 9 }, layoutButton: { width: 28, height: 25, borderRadius: 6, alignItems: 'center', justifyContent: 'center' }, pieceCount: { marginLeft: 'auto', fontSize: 8, fontWeight: '800', letterSpacing: 1 }, items: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }, itemsList: { flexDirection: 'column' }, itemCard: { width: '48.3%', borderRadius: 15, borderWidth: 1, overflow: 'hidden', marginBottom: 11, paddingBottom: 10 }, itemCardList: { width: '100%', flexDirection: 'row', alignItems: 'center', paddingBottom: 0, paddingRight: 8, minHeight: 91 }, itemImage: { width: '100%', height: 176 }, itemImageList: { width: 75, height: 87, borderRadius: 10, margin: 5 }, itemDetails: { paddingHorizontal: 9, paddingTop: 9 }, itemDetailsList: { flex: 1, paddingHorizontal: 9 }, categoryLabel: { fontSize: 7, letterSpacing: 1, fontWeight: '800' }, itemName: { fontSize: 11, fontWeight: '700', marginTop: 5 }, itemSub: { fontSize: 8, marginTop: 5 }, heart: { position: 'absolute', top: 9, right: 9, width: 29, height: 29, borderRadius: 15, alignItems: 'center', justifyContent: 'center' }, emptyState: { borderRadius: 17, borderWidth: 1, padding: 24, alignItems: 'center', marginBottom: 13 }, emptyGlyph: { fontSize: 28, marginBottom: 8 }, emptyTitle: { fontSize: 15, fontWeight: '700' }, emptyText: { fontSize: 10, lineHeight: 16, textAlign: 'center', marginTop: 6 }, careCard: { flexDirection: 'row', alignItems: 'center', borderRadius: 15, padding: 13, marginBottom: 20 }, careIcon: { fontSize: 22, marginRight: 10 }, careTitle: { fontSize: 10, fontWeight: '700' }, careBody: { fontSize: 8, lineHeight: 13, marginTop: 4 }, careArrow: { fontSize: 18, marginLeft: 8 },
});
