function createChatRepository(db) {
  return {
    list(userId) {
      return db.prepare(`SELECT c.id,c.peer_name,c.peer_handle,c.peer_avatar,c.peer_user_id,
        COALESCE((SELECT body FROM messages m WHERE m.user_id=c.user_id AND m.conversation_id=c.id ORDER BY m.id DESC LIMIT 1),'') AS last_message
        FROM conversations c WHERE c.user_id = ? ORDER BY c.id`).all(userId);
    },
    messages(userId, conversationId) {
      return db.prepare('SELECT id,sender,body,sent_at FROM messages WHERE user_id = ? AND conversation_id = ? ORDER BY id').all(userId, conversationId);
    },
    send(userId, conversationId, body) {
      const conversation = db.prepare('SELECT id,peer_user_id FROM conversations WHERE user_id = ? AND id = ?').get(userId, conversationId);
      if (!conversation) throw Object.assign(new Error('Conversation not found.'), { status: 404 });
      db.exec('BEGIN IMMEDIATE');
      let result;
      try {
        result = db.prepare("INSERT INTO messages (conversation_id,user_id,sender,body) VALUES (?,?,'me',?)").run(conversationId, userId, body);
        if (conversation.peer_user_id) {
          db.prepare("INSERT INTO messages (conversation_id,user_id,sender,body) VALUES (?,?,'them',?)").run(conversationId, conversation.peer_user_id, body);
        }
        db.exec('COMMIT');
      } catch (error) { db.exec('ROLLBACK'); throw error; }
      return {
        message: db.prepare('SELECT id,sender,body,sent_at FROM messages WHERE id = ?').get(Number(result.lastInsertRowid)),
        recipientUserId: conversation.peer_user_id || null,
      };
    },
    searchUsers(userId, query) {
      return db.prepare('SELECT id,name FROM users WHERE id <> ? AND name LIKE ? ORDER BY name LIMIT 20').all(userId, `%${query}%`);
    },
    startDirect(userId, peerUserId) {
      const peer = db.prepare('SELECT id,name FROM users WHERE id = ?').get(peerUserId);
      if (!peer || peer.id === userId) throw Object.assign(new Error('Choose another Zenvy member.'), { status: 404 });
      const me = db.prepare('SELECT id,name FROM users WHERE id = ?').get(userId);
      const conversationId = `dm:${Math.min(userId, peer.id)}:${Math.max(userId, peer.id)}`;
      const avatar = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=180&q=80';
      const add = db.prepare('INSERT OR IGNORE INTO conversations (id,user_id,peer_user_id,peer_handle,peer_name,peer_avatar) VALUES (?,?,?,?,?,?)');
      add.run(conversationId, userId, peer.id, String(peer.id), peer.name, avatar);
      add.run(conversationId, peer.id, userId, String(userId), me.name, avatar);
      return { id: conversationId, peer_name: peer.name, peer_handle: String(peer.id), peer_avatar: avatar };
    },
  };
}
module.exports = { createChatRepository };
