import { wardrobeSeed, articleSeed, communitySeed } from '../data/mockContent';

export async function migrateDatabase(db) {
  const version = await db.getFirstAsync('PRAGMA user_version');
  const currentVersion = version?.user_version || 0;
  if (currentVersion >= 2) return;
  await db.execAsync(`
    PRAGMA foreign_keys = ON;
    CREATE TABLE IF NOT EXISTS wardrobe_items (
      id INTEGER PRIMARY KEY, name TEXT NOT NULL, category TEXT NOT NULL, color TEXT NOT NULL,
      season TEXT NOT NULL, image_uri TEXT NOT NULL, favorite INTEGER NOT NULL DEFAULT 0,
      wears INTEGER NOT NULL DEFAULT 0, cost REAL NOT NULL DEFAULT 0, notes TEXT DEFAULT '',
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
    CREATE INDEX IF NOT EXISTS wardrobe_category_idx ON wardrobe_items(category);
    CREATE INDEX IF NOT EXISTS wardrobe_favorite_idx ON wardrobe_items(favorite);
    CREATE TABLE IF NOT EXISTS wear_log (
      id INTEGER PRIMARY KEY AUTOINCREMENT, item_id INTEGER NOT NULL REFERENCES wardrobe_items(id) ON DELETE CASCADE,
      worn_on TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS journal_articles (
      id INTEGER PRIMARY KEY, title TEXT NOT NULL, category TEXT NOT NULL, author TEXT NOT NULL,
      read_minutes INTEGER NOT NULL, image_uri TEXT NOT NULL, excerpt TEXT NOT NULL, body TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS bookmarked_articles (article_id INTEGER PRIMARY KEY REFERENCES journal_articles(id) ON DELETE CASCADE);
    CREATE TABLE IF NOT EXISTS community_posts (
      id INTEGER PRIMARY KEY, creator TEXT NOT NULL, handle TEXT NOT NULL, caption TEXT NOT NULL,
      category TEXT NOT NULL, location TEXT NOT NULL, image_uri TEXT NOT NULL, likes INTEGER NOT NULL DEFAULT 0,
      liked INTEGER NOT NULL DEFAULT 0
    );
    CREATE TABLE IF NOT EXISTS saved_posts (post_id INTEGER PRIMARY KEY REFERENCES community_posts(id) ON DELETE CASCADE);
    CREATE TABLE IF NOT EXISTS planned_outfits (
      day TEXT PRIMARY KEY, title TEXT NOT NULL, image_uri TEXT NOT NULL, notes TEXT DEFAULT '', updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS style_settings (
      id INTEGER PRIMARY KEY CHECK (id = 1), theme TEXT NOT NULL DEFAULT 'sage',
      article_layout TEXT NOT NULL DEFAULT 'editorial', trend_layout TEXT NOT NULL DEFAULT 'mosaic', city TEXT DEFAULT 'London'
    );
    CREATE TABLE IF NOT EXISTS activity_log (
      id INTEGER PRIMARY KEY AUTOINCREMENT, steps INTEGER NOT NULL DEFAULT 0, distance_meters REAL NOT NULL DEFAULT 0,
      recorded_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS followed_creators (creator_id TEXT PRIMARY KEY, display_name TEXT NOT NULL, followed_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP);
    CREATE TABLE IF NOT EXISTS creator_outfit_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT, creator_id TEXT NOT NULL, display_name TEXT NOT NULL, outfit_title TEXT NOT NULL,
      caption TEXT NOT NULL, image_uri TEXT NOT NULL, location TEXT NOT NULL, worn_on TEXT NOT NULL, UNIQUE(creator_id, worn_on)
    );
    CREATE INDEX IF NOT EXISTS outfit_history_creator_date_idx ON creator_outfit_history(creator_id, worn_on DESC);
    CREATE TABLE IF NOT EXISTS chat_conversations (
      id TEXT PRIMARY KEY, peer_name TEXT NOT NULL, peer_handle TEXT NOT NULL, peer_avatar TEXT NOT NULL,
      last_message TEXT NOT NULL DEFAULT '', updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS chat_messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT, conversation_id TEXT NOT NULL REFERENCES chat_conversations(id) ON DELETE CASCADE,
      sender TEXT NOT NULL, body TEXT NOT NULL, sent_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, sync_status TEXT NOT NULL DEFAULT 'local'
    );
    CREATE TABLE IF NOT EXISTS assistant_messages (id INTEGER PRIMARY KEY AUTOINCREMENT, role TEXT NOT NULL, body TEXT NOT NULL, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP);
    CREATE TABLE IF NOT EXISTS notification_preferences (
      id INTEGER PRIMARY KEY CHECK (id = 1), outfit_reminder INTEGER NOT NULL DEFAULT 0,
      reminder_hour INTEGER NOT NULL DEFAULT 8, reminder_minute INTEGER NOT NULL DEFAULT 30, updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);

  for (const item of wardrobeSeed) {
    await db.runAsync(
      'INSERT OR IGNORE INTO wardrobe_items (id,name,category,color,season,image_uri,favorite,wears,cost) VALUES (?,?,?,?,?,?,?,?,?)',
      item.id, item.name, item.category, item.color, item.season, item.image, item.favorite, item.wears, item.cost,
    );
  }
  for (const article of articleSeed) {
    await db.runAsync(
      'INSERT OR IGNORE INTO journal_articles (id,title,category,author,read_minutes,image_uri,excerpt,body) VALUES (?,?,?,?,?,?,?,?)',
      article.id, article.title, article.category, article.author, article.read_minutes, article.image, article.excerpt, article.body,
    );
  }
  for (const post of communitySeed) {
    await db.runAsync(
      'INSERT OR IGNORE INTO community_posts (id,creator,handle,caption,category,location,image_uri,likes,liked) VALUES (?,?,?,?,?,?,?,?,?)',
      post.id, post.creator, post.handle, post.caption, post.category, post.location, post.image, post.likes, post.liked,
    );
  }
  await db.runAsync('INSERT OR IGNORE INTO style_settings (id,theme,article_layout,trend_layout,city) VALUES (1,?,?,?,?)', 'sage', 'editorial', 'mosaic', 'London');
  const existingFollows = await db.getFirstAsync('SELECT creator_id FROM followed_creators LIMIT 1');
  if (!existingFollows) {
    await db.runAsync('INSERT OR IGNORE INTO followed_creators (creator_id,display_name) VALUES (?,?)', 'mila.wears', 'Mila Chen');
    await db.runAsync('INSERT OR IGNORE INTO followed_creators (creator_id,display_name) VALUES (?,?)', 'atelier.mai', 'Mai Laurent');
  }
  const historySeeded = await db.getFirstAsync('SELECT id FROM creator_outfit_history LIMIT 1');
  if (!historySeeded) {
    const creators = [
      { id: 'mila.wears', name: 'Mila Chen', image: 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=900&q=86', location: 'London' },
      { id: 'lena.in.colour', name: 'Lena Ortiz', image: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=900&q=86', location: 'Brooklyn' },
      { id: 'atelier.mai', name: 'Mai Laurent', image: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=900&q=86', location: 'Paris' },
      { id: 'sunday.with.sana', name: 'Sana Ali', image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=900&q=86', location: 'London' },
    ];
    for (const creator of creators) {
      for (let day = 0; day < 7; day += 1) {
        const wornOn = new Date(); wornOn.setDate(wornOn.getDate() - day);
        const date = wornOn.toISOString().slice(0, 10);
        await db.runAsync('INSERT OR IGNORE INTO creator_outfit_history (creator_id,display_name,outfit_title,caption,image_uri,location,worn_on) VALUES (?,?,?,?,?,?,?)',
          creator.id, creator.name, ['Soft layers', 'Colour in the details', 'A favourite, again', 'Coffee walk edit', 'Easy Sunday', 'Little vintage moment', 'Repeat outfit joy'][day],
          ['A real-life outfit diary entry.', 'Worn again, loved again.', 'A small detail made the look.', 'The pieces that feel like me.'][day % 4],
          creator.image, creator.location, date);
      }
    }
  }
  const chatsSeeded = await db.getFirstAsync('SELECT id FROM chat_conversations LIMIT 1');
  if (!chatsSeeded) {
    const chats = [
      ['mila-chat', 'Mila Chen', 'mila.wears', 'I found a great way to style that blazer'],
      ['mai-chat', 'Mai Laurent', 'atelier.mai', 'Repeating an outfit is always a good idea ✨'],
      ['lena-chat', 'Lena Ortiz', 'lena.in.colour', 'The colour combination you posted is lovely!'],
    ];
    for (const [id, name, handle, message] of chats) {
      await db.runAsync('INSERT OR IGNORE INTO chat_conversations (id,peer_name,peer_handle,peer_avatar,last_message) VALUES (?,?,?,?,?)', id, name, handle, 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=180&q=80', message);
      await db.runAsync('INSERT INTO chat_messages (conversation_id,sender,body,sync_status) VALUES (?,?,?,?)', id, 'them', message, 'local');
    }
  }
  await db.runAsync('INSERT OR IGNORE INTO notification_preferences (id,outfit_reminder,reminder_hour,reminder_minute) VALUES (1,0,8,30)');
  const activitySeeded = await db.getFirstAsync('SELECT id FROM activity_log LIMIT 1');
  if (!activitySeeded) await db.runAsync('INSERT INTO activity_log (steps,distance_meters) VALUES (?,?)', 6842, 5120);
  await db.execAsync('PRAGMA user_version = 2');
}
