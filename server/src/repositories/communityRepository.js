function createCommunityRepository(db) {
  return {
    getOutfits(creatorId) {
      return db.prepare(`SELECT o.id,c.id AS creator_id,c.display_name,o.outfit_title,o.caption,o.image_uri,
        c.location,o.worn_on FROM creator_outfits o JOIN creators c ON c.id = o.creator_id
        WHERE c.id = ? ORDER BY o.worn_on DESC`).all(creatorId);
    },
    listFollowing(userId) {
      return db.prepare('SELECT c.id AS creator_id,c.display_name,c.location,c.avatar_uri FROM follows f JOIN creators c ON c.id=f.creator_id WHERE f.user_id = ? ORDER BY c.display_name').all(userId);
    },
    getFollowingOutfits(userId) {
      return db.prepare(`SELECT o.id,c.id AS creator_id,c.display_name,o.outfit_title,o.caption,o.image_uri,c.location,o.worn_on
        FROM follows f JOIN creators c ON c.id=f.creator_id JOIN creator_outfits o ON o.creator_id=c.id
        WHERE f.user_id = ? ORDER BY o.worn_on DESC,o.id DESC`).all(userId);
    },
    follow(userId, creatorId) {
      const creator = db.prepare('SELECT id FROM creators WHERE id = ?').get(creatorId);
      if (!creator) throw Object.assign(new Error('Creator not found.'), { status: 404 });
      db.prepare('INSERT OR IGNORE INTO follows (user_id,creator_id) VALUES (?,?)').run(userId, creatorId);
    },
    unfollow(userId, creatorId) { db.prepare('DELETE FROM follows WHERE user_id = ? AND creator_id = ?').run(userId, creatorId); },
  };
}
module.exports = { createCommunityRepository };
