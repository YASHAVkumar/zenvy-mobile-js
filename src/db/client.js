import { wardrobeSeed, articleSeed, communitySeed } from '../data/mockContent';

export async function migrateDatabase(db) {
  const version = await db.getFirstAsync('PRAGMA user_version');
  const currentVersion = version?.user_version || 0;
  if (currentVersion > 1) return;
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
  const activitySeeded = await db.getFirstAsync('SELECT id FROM activity_log LIMIT 1');
  if (!activitySeeded) await db.runAsync('INSERT INTO activity_log (steps,distance_meters) VALUES (?,?)', 6842, 5120);
  await db.execAsync('PRAGMA user_version = 1');
}
