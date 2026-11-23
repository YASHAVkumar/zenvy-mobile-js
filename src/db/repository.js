const cleanRows = (rows) => rows.map((row) => ({ ...row, favorite: Boolean(row.favorite), liked: Boolean(row.liked) }));

export async function getWardrobe(db, { category = 'All', search = '', favoriteOnly = false } = {}) {
  const where = [];
  const args = [];
  if (category !== 'All') { where.push('category = ?'); args.push(category); }
  if (search.trim()) { where.push('(name LIKE ? OR color LIKE ? OR category LIKE ?)'); const term = `%${search.trim()}%`; args.push(term, term, term); }
  if (favoriteOnly) where.push('favorite = 1');
  const rows = await db.getAllAsync(`SELECT * FROM wardrobe_items${where.length ? ` WHERE ${where.join(' AND ')}` : ''} ORDER BY created_at DESC, id DESC`, ...args);
  return cleanRows(rows);
}

export async function addWardrobeItem(db, item) {
  const result = await db.runAsync(
    'INSERT INTO wardrobe_items (name,category,color,season,image_uri,notes) VALUES (?,?,?,?,?,?)',
    item.name.trim(), item.category, item.color.trim() || 'Not set', item.season || 'All year', item.imageUri, item.notes || '',
  );
  return result.lastInsertRowId;
}

export async function getWardrobeItem(db, id) {
  const row = await db.getFirstAsync('SELECT * FROM wardrobe_items WHERE id = ?', id);
  return row ? { ...row, favorite: Boolean(row.favorite) } : null;
}

export async function updateWardrobePhoto(db, id, imageUri) {
  await db.runAsync('UPDATE wardrobe_items SET image_uri = ? WHERE id = ?', imageUri, id);
}

export async function toggleWardrobeFavorite(db, id) {
  await db.runAsync('UPDATE wardrobe_items SET favorite = CASE favorite WHEN 1 THEN 0 ELSE 1 END WHERE id = ?', id);
}

export async function deleteWardrobeItem(db, id) {
  await db.runAsync('DELETE FROM wardrobe_items WHERE id = ?', id);
}

export async function recordWear(db, id) {
  await db.runAsync('UPDATE wardrobe_items SET wears = wears + 1 WHERE id = ?', id);
  await db.runAsync('INSERT INTO wear_log (item_id) VALUES (?)', id);
}

export async function getArticles(db) {
  return db.getAllAsync(`SELECT a.*, CASE WHEN b.article_id IS NULL THEN 0 ELSE 1 END AS bookmarked
    FROM journal_articles a LEFT JOIN bookmarked_articles b ON b.article_id = a.id ORDER BY a.id`);
}

export async function getArticle(db, id) {
  return db.getFirstAsync(`SELECT a.*, CASE WHEN b.article_id IS NULL THEN 0 ELSE 1 END AS bookmarked
    FROM journal_articles a LEFT JOIN bookmarked_articles b ON b.article_id = a.id WHERE a.id = ?`, id);
}

export async function toggleArticleBookmark(db, id) {
  const row = await db.getFirstAsync('SELECT article_id FROM bookmarked_articles WHERE article_id = ?', id);
  if (row) await db.runAsync('DELETE FROM bookmarked_articles WHERE article_id = ?', id);
  else await db.runAsync('INSERT OR IGNORE INTO bookmarked_articles (article_id) VALUES (?)', id);
}

export async function isArticleBookmarked(db, id) {
  const row = await db.getFirstAsync('SELECT article_id FROM bookmarked_articles WHERE article_id = ?', id);
  return Boolean(row);
}

export async function getCommunityPosts(db) {
  return cleanRows(await db.getAllAsync('SELECT * FROM community_posts ORDER BY id'));
}

export async function toggleCommunityLike(db, id) {
  await db.runAsync('UPDATE community_posts SET likes = likes + CASE liked WHEN 1 THEN -1 ELSE 1 END, liked = CASE liked WHEN 1 THEN 0 ELSE 1 END WHERE id = ?', id);
}

export async function toggleSavedPost(db, id) {
  const row = await db.getFirstAsync('SELECT post_id FROM saved_posts WHERE post_id = ?', id);
  if (row) await db.runAsync('DELETE FROM saved_posts WHERE post_id = ?', id);
  else await db.runAsync('INSERT OR IGNORE INTO saved_posts (post_id) VALUES (?)', id);
}

export async function addCommunityPost(db, post) {
  const result = await db.runAsync('INSERT INTO community_posts (creator,handle,caption,category,location,image_uri,likes,liked) VALUES (?,?,?,?,?,?,0,0)', post.creator, post.handle, post.caption, post.category, post.location, post.imageUri);
  return result.lastInsertRowId;
}

export async function getSavedPostIds(db) {
  const rows = await db.getAllAsync('SELECT post_id FROM saved_posts');
  return new Set(rows.map((row) => row.post_id));
}

export async function getSetting(db) {
  return db.getFirstAsync('SELECT * FROM style_settings WHERE id = 1');
}

export async function updateSetting(db, field, value) {
  const allowed = ['theme', 'article_layout', 'trend_layout', 'city'];
  if (!allowed.includes(field)) throw new Error(`Unsupported settings field: ${field}`);
  await db.runAsync(`UPDATE style_settings SET ${field} = ? WHERE id = 1`, value);
}

export async function getOutfitForDay(db, day) {
  return db.getFirstAsync('SELECT * FROM planned_outfits WHERE day = ?', day);
}

export async function saveOutfitForDay(db, { day, title, imageUri, notes = '' }) {
  await db.runAsync('INSERT OR REPLACE INTO planned_outfits (day,title,image_uri,notes,updated_at) VALUES (?,?,?,?,CURRENT_TIMESTAMP)', day, title, imageUri, notes);
}

export async function removeOutfitForDay(db, day) {
  await db.runAsync('DELETE FROM planned_outfits WHERE day = ?', day);
}

export async function getWardrobeStats(db) {
  return db.getFirstAsync(`SELECT COUNT(*) AS total, SUM(favorite) AS favorites,
    COALESCE(ROUND(AVG(wears)),0) AS average_wears, COALESCE(SUM(cost),0) AS wardrobe_value FROM wardrobe_items`);
}

export async function getActivityBaseline(db) {
  const row = await db.getFirstAsync('SELECT steps FROM activity_log ORDER BY id DESC LIMIT 1');
  return row?.steps ?? 0;
}

export async function getFollowing(db) {
  return db.getAllAsync('SELECT * FROM followed_creators ORDER BY display_name');
}
export async function isFollowing(db, creatorId) {
  return Boolean(await db.getFirstAsync('SELECT creator_id FROM followed_creators WHERE creator_id = ?', creatorId));
}
export async function toggleFollowing(db, creatorId, displayName) {
  if (await isFollowing(db, creatorId)) await db.runAsync('DELETE FROM followed_creators WHERE creator_id = ?', creatorId);
  else await db.runAsync('INSERT OR IGNORE INTO followed_creators (creator_id,display_name) VALUES (?,?)', creatorId, displayName);
}
export async function getCreatorOutfits(db, creatorId) {
  return db.getAllAsync('SELECT * FROM creator_outfit_history WHERE creator_id = ? ORDER BY worn_on DESC', creatorId);
}
export async function getFollowingOutfits(db) {
  return db.getAllAsync('SELECT h.* FROM creator_outfit_history h INNER JOIN followed_creators f ON f.creator_id = h.creator_id ORDER BY h.worn_on DESC, h.id DESC');
}
export async function getConversations(db) {
  return db.getAllAsync('SELECT * FROM chat_conversations ORDER BY updated_at DESC, id');
}
export async function getMessages(db, conversationId) {
  return db.getAllAsync('SELECT * FROM chat_messages WHERE conversation_id = ? ORDER BY id', conversationId);
}
export async function sendLocalMessage(db, conversationId, body) {
  await db.runAsync('INSERT INTO chat_messages (conversation_id,sender,body,sync_status) VALUES (?,?,?,?)', conversationId, 'me', body.trim(), 'local');
  await db.runAsync('UPDATE chat_conversations SET last_message = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', body.trim(), conversationId);
}
export async function getAssistantMessages(db) {
  return db.getAllAsync('SELECT * FROM assistant_messages ORDER BY id');
}
export async function addAssistantMessage(db, role, body) {
  await db.runAsync('INSERT INTO assistant_messages (role,body) VALUES (?,?)', role, body);
}
export async function getNotificationPreferences(db) {
  return db.getFirstAsync('SELECT * FROM notification_preferences WHERE id = 1');
}
export async function updateReminderPreference(db, enabled, hour = 8, minute = 30) {
  await db.runAsync('UPDATE notification_preferences SET outfit_reminder = ?, reminder_hour = ?, reminder_minute = ?, updated_at = CURRENT_TIMESTAMP WHERE id = 1', enabled ? 1 : 0, hour, minute);
}
