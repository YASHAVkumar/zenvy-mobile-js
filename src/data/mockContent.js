const photo = (id, width = 900) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${width}&q=86`;

export const wardrobeSeed = [
  { id: 1, name: 'The Sunday blazer', category: 'Outerwear', color: 'Oat milk', season: 'All year', image: photo('photo-1591047139829-d91aecb6caea'), favorite: 1, wears: 12, cost: 148 },
  { id: 2, name: 'Relaxed straight jean', category: 'Bottoms', color: 'Vintage blue', season: 'All year', image: photo('photo-1541099649105-f69ad21f3246'), favorite: 0, wears: 21, cost: 89 },
  { id: 3, name: 'Cashmere cloud knit', category: 'Knitwear', color: 'Natural', season: 'Autumn', image: photo('photo-1576566588028-4147f3842f27'), favorite: 1, wears: 8, cost: 125 },
  { id: 4, name: 'Everywhere trainers', category: 'Shoes', color: 'Soft white', season: 'All year', image: photo('photo-1542291026-7eec264c27ff'), favorite: 0, wears: 30, cost: 110 },
  { id: 5, name: 'Market day tote', category: 'Accessories', color: 'Cognac', season: 'All year', image: photo('photo-1590874103328-eac38a683ce7'), favorite: 1, wears: 19, cost: 76 },
  { id: 6, name: 'Olive hour dress', category: 'Dresses', color: 'Garden olive', season: 'Spring', image: photo('photo-1496747611176-843222e1e57c'), favorite: 0, wears: 5, cost: 132 },
  { id: 7, name: 'Weekend stripe shirt', category: 'Tops', color: 'Blue stripe', season: 'Summer', image: photo('photo-1598554747436-c9293d6a588f'), favorite: 0, wears: 14, cost: 68 },
  { id: 8, name: 'Soft structure coat', category: 'Outerwear', color: 'Warm stone', season: 'Winter', image: photo('photo-1548624149-f24bbd7156d8'), favorite: 0, wears: 3, cost: 240 },
];

export const articleSeed = [
  { id: 1, title: 'The joy of getting dressed slowly', category: 'MINDFUL STYLE', author: 'Nia James', read_minutes: 5, image: photo('photo-1483985988355-763728e1935b'), excerpt: 'A gentle case for buying less, noticing more and giving the clothes you own a longer story.', body: 'Getting dressed can be the first small act of care in your day. Before the calendar fills, before the noise finds you, you get to choose how you want to meet the morning. Start with the piece that already feels like you.\n\nA considered wardrobe is not a perfect wardrobe. It is a collection of good memories, useful layers and occasional surprises. When you look at what is already there, familiar pieces start to show up in new ways. A knit that has been waiting for a warm afternoon. A scarf that turns an old favourite into something fresh.\n\nThere is no finish line to personal style. There is only the pleasure of paying attention. Wear the thing you love. Repeat it. Let it become part of your story.' },
  { id: 2, title: 'Five pieces, a whole little week', category: 'THE CAPSULE EDIT', author: 'Clara Reid', read_minutes: 4, image: photo('photo-1539109136881-3be0616acf4b'), excerpt: 'A small wardrobe exercise for finding more outfits in the pieces you reach for most.', body: 'A capsule does not need a dress code. Pick five pieces you feel good in: one layer, one easy top, one pair of trousers, one alternative and one finishing touch.\n\nWear them for a week. Notice what feels effortless and what feels like a compromise. The surprising combinations are the point. A good outfit is often just a familiar piece meeting a new one.' },
  { id: 3, title: 'Colour, but make it personal', category: 'COLOUR NOTES', author: 'Mira Sol', read_minutes: 6, image: photo('photo-1529139574466-a303027c1d8b'), excerpt: 'Forget the rules for a moment. Begin with the colours that make you feel at home.', body: 'Colour is not a test you have to pass. Think of the shades you reach for when you want comfort, and the ones that make you stand a little taller. Put them beside a neutral you already wear.\n\nTry a colour close to your face, then as a small accent. The best palette is not a theory. It is the set of colours that makes the wardrobe you own easier to wear.' },
  { id: 4, title: 'A little more care, a lot more wear', category: 'CLOTHING CARE', author: 'Nia James', read_minutes: 3, image: photo('photo-1485230895905-ec40ba36b9bc'), excerpt: 'Simple repair and care rituals that help your favourites stay favourites.', body: 'Air a knit before washing it. Brush a coat after a long day. Keep a small repair kit where you can see it. The less dramatic a care routine feels, the more likely it is to stick.\n\nA missing button is an invitation to slow down for ten minutes. A worn hem can be mended. Caring for clothes is a practical way to honour the things that already serve you.' },
];

export const communitySeed = [
  { id: 1, creator: 'mila.wears', handle: 'Mila Chen', caption: 'A soft layer for a city that can’t decide what season it is. All from the back of my wardrobe.', category: 'LAYERING', location: 'London', image: photo('photo-1529139574466-a303027c1d8b'), likes: 128, liked: 0 },
  { id: 2, creator: 'lena.in.colour', handle: 'Lena Ortiz', caption: 'One bright scarf, an old friend of a coat, and a reason to take the long way home.', category: 'COLOUR STORY', location: 'Brooklyn', image: photo('photo-1539109136881-3be0616acf4b'), likes: 94, liked: 0 },
  { id: 3, creator: 'atelier.mai', handle: 'Mai Laurent', caption: 'Repeat outfit, repeat joy. This little dress has been with me through three summers.', category: 'REWEAR', location: 'Paris', image: photo('photo-1496747611176-843222e1e57c'), likes: 216, liked: 0 },
  { id: 4, creator: 'sunday.with.sana', handle: 'Sana Ali', caption: 'Vintage denim, a borrowed shirt and nowhere urgent to be.', category: 'SLOW SUNDAY', location: 'London', image: photo('photo-1483985988355-763728e1935b'), likes: 75, liked: 0 },
];

export const trendSeed = [
  { id: 1, title: 'Soft structure', descriptor: 'An easy blazer over a lived-in tee.', category: 'LAYERING', image: photo('photo-1591047139829-d91aecb6caea'), tone: '#E5E8DC' },
  { id: 2, title: 'The long line', descriptor: 'Long skirts, short jackets, all balance.', category: 'SILHOUETTE', image: photo('photo-1496747611176-843222e1e57c'), tone: '#ECE3DC' },
  { id: 3, title: 'Sunday blue', descriptor: 'Denim with a little more intention.', category: 'COLOUR', image: photo('photo-1541099649105-f69ad21f3246'), tone: '#E2E7EB' },
  { id: 4, title: 'Borrowed sunshine', descriptor: 'Warm colours for cooler mornings.', category: 'PALETTE', image: photo('photo-1485230895905-ec40ba36b9bc'), tone: '#F1E7D9' },
];

export const nearbySeed = [
  { id: 'repair', name: 'The Mending Room', type: 'Clothing repair', distance: '0.6 mi', address: 'Independent repair studio', icon: '✳' },
  { id: 'vintage', name: 'Sunday Archive', type: 'Vintage & resale', distance: '0.9 mi', address: 'Curated pre-loved pieces', icon: '◇' },
  { id: 'market', name: 'Flower & Found', type: 'Local makers', distance: '1.3 mi', address: 'Weekend makers market', icon: '✿' },
  { id: 'laundry', name: 'Good Earth Care', type: 'Garment care', distance: '1.7 mi', address: 'Gentle, local dry cleaning', icon: '⌂' },
];

export const outfitIdeas = [
  { id: 'sunday-layers', title: 'Sunday, in soft layers', note: 'Relaxed layers · 3 pieces', image: photo('photo-1483985988355-763728e1935b'), pieces: 'The Sunday blazer · Cashmere cloud knit · Relaxed straight jean' },
  { id: 'long-lunch', title: 'A long lunch kind of day', note: 'Easy tailoring · 4 pieces', image: photo('photo-1539109136881-3be0616acf4b'), pieces: 'Olive hour dress · Soft structure coat · Everywhere trainers' },
  { id: 'city-wander', title: 'Coffee, then the long way', note: 'Off-duty · 3 pieces', image: photo('photo-1529139574466-a303027c1d8b'), pieces: 'Weekend stripe shirt · Relaxed straight jean · Market day tote' },
  { id: 'golden-hour', title: 'Golden hour plans', note: 'Dinner ready · 3 pieces', image: photo('photo-1485230895905-ec40ba36b9bc'), pieces: 'Olive hour dress · The Sunday blazer · Market day tote' },
];
