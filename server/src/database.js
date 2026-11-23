const fs = require('node:fs');
const path = require('node:path');
const { DatabaseSync } = require('node:sqlite');

function createDatabase(databasePath) {
  fs.mkdirSync(path.dirname(databasePath), { recursive: true });
  const db = new DatabaseSync(databasePath);
  db.exec('PRAGMA foreign_keys = ON; PRAGMA journal_mode = WAL;');
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, email TEXT NOT NULL UNIQUE COLLATE NOCASE,
      password_hash TEXT NOT NULL, password_salt TEXT NOT NULL, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS creators (
      id TEXT PRIMARY KEY, display_name TEXT NOT NULL, location TEXT NOT NULL, bio TEXT NOT NULL, avatar_uri TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS creator_outfits (
      id INTEGER PRIMARY KEY AUTOINCREMENT, creator_id TEXT NOT NULL REFERENCES creators(id),
      outfit_title TEXT NOT NULL, caption TEXT NOT NULL, image_uri TEXT NOT NULL, worn_on TEXT NOT NULL,
      UNIQUE(creator_id, worn_on)
    );
    CREATE TABLE IF NOT EXISTS follows (
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE, creator_id TEXT NOT NULL REFERENCES creators(id),
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, PRIMARY KEY(user_id, creator_id)
    );
    CREATE TABLE IF NOT EXISTS conversations (
      id TEXT NOT NULL, user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      peer_user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      peer_handle TEXT NOT NULL, peer_name TEXT NOT NULL, peer_avatar TEXT NOT NULL, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY(id, user_id)
    );
    CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT, conversation_id TEXT NOT NULL, user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      sender TEXT NOT NULL CHECK(sender IN ('me','them')), body TEXT NOT NULL, sent_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(conversation_id, user_id) REFERENCES conversations(id, user_id) ON DELETE CASCADE
    );
    CREATE INDEX IF NOT EXISTS messages_conversation_idx ON messages(user_id, conversation_id, id);
    CREATE TABLE IF NOT EXISTS push_devices (
      id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      push_token TEXT NOT NULL, platform TEXT NOT NULL, updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, push_token)
    );
  `);
  const conversationColumns = db.prepare('PRAGMA table_info(conversations)').all();
  if (!conversationColumns.some((column) => column.name === 'peer_user_id')) {
    db.exec('ALTER TABLE conversations ADD COLUMN peer_user_id INTEGER REFERENCES users(id) ON DELETE CASCADE');
  }
  seedCreators(db);
  return db;
}

function seedCreators(db) {
  const creators = [
    ['mila.wears', 'Mila Chen', 'London', 'Soft layers, favourite repeats and taking the scenic route.', 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=900&q=86'],
    ['lena.in.colour', 'Lena Ortiz', 'Brooklyn', 'Finding the colour in everyday things.', 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=900&q=86'],
    ['atelier.mai', 'Mai Laurent', 'Paris', 'A little atelier of outfits I love to wear again.', 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=900&q=86'],
    ['sunday.with.sana', 'Sana Ali', 'London', 'Vintage denim and nowhere urgent to be.', 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=900&q=86'],
  ];
  const addCreator = db.prepare('INSERT OR IGNORE INTO creators (id,display_name,location,bio,avatar_uri) VALUES (?,?,?,?,?)');
  for (const creator of creators) addCreator.run(...creator);
  const exists = db.prepare('SELECT 1 AS found FROM creator_outfits LIMIT 1').get();
  if (exists) return;
  const addOutfit = db.prepare('INSERT OR IGNORE INTO creator_outfits (creator_id,outfit_title,caption,image_uri,worn_on) VALUES (?,?,?,?,?)');
  for (const [creatorId, , location, , image] of creators) {
    for (let day = 0; day < 7; day += 1) {
      const date = new Date(); date.setDate(date.getDate() - day);
      const wornOn = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
      addOutfit.run(creatorId, ['Soft layers', 'Colour in the details', 'A favourite, again', 'Coffee walk edit', 'Easy Sunday', 'Little vintage moment', 'Repeat outfit joy'][day],
        ['A real-life outfit diary entry.', 'Worn again, loved again.', 'A small detail made the look.', 'The pieces that feel like me.'][day % 4], image, wornOn);
    }
  }
}

module.exports = { createDatabase };
