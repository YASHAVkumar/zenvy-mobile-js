const { hashPassword, verifyPassword } = require('../security/passwords');
const { signToken } = require('../security/jwt');

function createAuthService(db, jwtSecret) {
  const publicUser = (user) => ({ id: user.id, name: user.name, email: user.email });
  function issue(user) {
    return { accessToken: signToken(user, jwtSecret), user: publicUser(user) };
  }
  async function register({ name, email, password }) {
    const normalizedEmail = String(email || '').trim().toLowerCase();
    const displayName = String(name || '').trim();
    if (displayName.length < 2 || displayName.length > 60) throw Object.assign(new Error('Name must be between 2 and 60 characters.'), { status: 400 });
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) throw Object.assign(new Error('Enter a valid email address.'), { status: 400 });
    if (typeof password !== 'string' || password.length < 10 || password.length > 128) throw Object.assign(new Error('Password must be between 10 and 128 characters.'), { status: 400 });
    if (db.prepare('SELECT id FROM users WHERE email = ?').get(normalizedEmail)) throw Object.assign(new Error('An account already uses this email.'), { status: 409 });
    const credential = await hashPassword(password);
    const result = db.prepare('INSERT INTO users (name,email,password_hash,password_salt) VALUES (?,?,?,?)').run(displayName, normalizedEmail, credential.hash, credential.salt);
    const user = db.prepare('SELECT id,name,email FROM users WHERE id = ?').get(Number(result.lastInsertRowid));
    seedConversationsForUser(db, user.id);
    return issue(user);
  }
  async function login({ email, password }) {
    const user = db.prepare('SELECT id,name,email,password_hash,password_salt FROM users WHERE email = ?').get(String(email || '').trim().toLowerCase());
    if (!user || typeof password !== 'string' || !await verifyPassword(password, user.password_salt, user.password_hash)) {
      throw Object.assign(new Error('Email or password is incorrect.'), { status: 401 });
    }
    return issue(user);
  }
  return { login, register };
}

function seedConversationsForUser(db, userId) {
  db.prepare('INSERT OR IGNORE INTO follows (user_id,creator_id) VALUES (?,?)').run(userId, 'mila.wears');
  db.prepare('INSERT OR IGNORE INTO follows (user_id,creator_id) VALUES (?,?)').run(userId, 'atelier.mai');
  const creators = db.prepare('SELECT id,display_name,avatar_uri FROM creators ORDER BY id').all();
  const addConversation = db.prepare('INSERT OR IGNORE INTO conversations (id,user_id,peer_handle,peer_name,peer_avatar) VALUES (?,?,?,?,?)');
  const addMessage = db.prepare("INSERT INTO messages (conversation_id,user_id,sender,body) VALUES (?,?,'them',?)");
  const messages = [
    'I found a lovely way to style that blazer.',
    'Repeating an outfit is always a good idea ✨',
    'The colour combination you shared is lovely!',
  ];
  for (const [index, creator] of creators.entries()) {
    const id = `${userId}:${creator.id}`;
    addConversation.run(id, userId, creator.id, creator.display_name, creator.avatar_uri);
    if (!db.prepare('SELECT 1 AS found FROM messages WHERE user_id = ? AND conversation_id = ? LIMIT 1').get(userId, id)) {
      addMessage.run(id, userId, messages[index % messages.length]);
    }
  }
}

module.exports = { createAuthService };
