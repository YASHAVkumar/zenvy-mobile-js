const http = require('node:http');
const { createDatabase } = require('./database');
const { readConfig } = require('./config');
const { requireUser } = require('./middleware/auth');
const { createAuthService } = require('./services/authService');
const { createChatRepository } = require('./repositories/chatRepository');
const { createCommunityRepository } = require('./repositories/communityRepository');
const { createRateLimiter } = require('./http/rateLimiter');
const { getStyleSuggestion } = require('./services/styleAssistantService');
const { sendChatPush } = require('./services/pushService');

const config = readConfig();
const db = createDatabase(config.databasePath);
const auth = createAuthService(db, config.jwtSecret);
const getUser = requireUser(db, config.jwtSecret);
const chat = createChatRepository(db);
const community = createCommunityRepository(db);
const rateLimit = createRateLimiter();

function send(response, status, payload) {
  response.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' });
  response.end(payload === null ? '' : JSON.stringify(payload));
}
async function readBody(request) {
  const chunks = []; let total = 0;
  for await (const chunk of request) {
    total += chunk.length;
    if (total > 64 * 1024) throw Object.assign(new Error('Request is too large.'), { status: 413 });
    chunks.push(chunk);
  }
  if (!total) return {};
  try { return JSON.parse(Buffer.concat(chunks).toString('utf8')); }
  catch { throw Object.assign(new Error('Request body must be valid JSON.'), { status: 400 }); }
}
function validateMessage(body) {
  if (typeof body !== 'string' || !body.trim() || body.length > 2000) throw Object.assign(new Error('Message must be between 1 and 2000 characters.'), { status: 400 });
  return body.trim();
}
async function handle(request, response) {
  const origin = request.headers.origin || '';
  response.setHeader('Access-Control-Allow-Origin', config.allowedOrigin === '*' ? '*' : origin === config.allowedOrigin ? origin : config.allowedOrigin);
  response.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  response.setHeader('Vary', 'Origin');
  if (request.method === 'OPTIONS') return send(response, 204, null);
  const url = new URL(request.url, 'http://localhost');
  const method = request.method;
  const path = url.pathname;
  const body = ['POST', 'PUT', 'PATCH'].includes(method) ? await readBody(request) : {};

  if (method === 'GET' && path === '/health') return send(response, 200, { status: 'ok', service: 'zenvy-api' });
  if (method === 'GET' && path === '/app/releases') return send(response, 200, { releases: [
    { version: '1.0.0', date: 'November 2026', title: 'A more personal kind of style', body: 'Seven-day outfit diaries, creator follows, conversation previews, local reminders, and a wardrobe-aware style guide.' },
    { version: '0.9.0', date: 'October 2026', title: 'The Zenvy preview', body: 'Camera and gallery capture, outfit planning, themes, movement insights and daily style notes.' },
  ] });
  if (method === 'POST' && (path === '/auth/register' || path === '/auth/login')) {
    if (!rateLimit(request.socket.remoteAddress || 'unknown')) return send(response, 429, { message: 'Too many sign-in attempts. Try again shortly.' });
    try { return send(response, path.endsWith('register') ? 201 : 200, path.endsWith('register') ? await auth.register(body) : await auth.login(body)); }
    catch (error) { if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') return send(response, 409, { message: 'An account already uses this email.' }); throw error; }
  }

  const user = getUser(request);
  const outfitPath = path.match(/^\/community\/users\/([^/]+)\/outfits$/);
  if (method === 'GET' && outfitPath) {
    const creatorId = decodeURIComponent(outfitPath[1]);
    return send(response, 200, { outfits: community.getOutfits(creatorId) });
  }
  if (method === 'GET' && path === '/community/following') return send(response, 200, { creators: community.listFollowing(user.id) });
  if (method === 'GET' && path === '/community/following/outfits') return send(response, 200, { outfits: community.getFollowingOutfits(user.id) });
  const followPath = path.match(/^\/community\/following\/([^/]+)$/);
  if (followPath && method === 'PUT') { community.follow(user.id, decodeURIComponent(followPath[1])); return send(response, 204, null); }
  if (followPath && method === 'DELETE') { community.unfollow(user.id, decodeURIComponent(followPath[1])); return send(response, 204, null); }
  if (method === 'GET' && path === '/users/search') {
    const query = String(url.searchParams.get('q') || '').trim().slice(0, 60);
    if (query.length < 2) return send(response, 200, { users: [] });
    return send(response, 200, { users: chat.searchUsers(user.id, query) });
  }
  if (method === 'POST' && path === '/chat/conversations') {
    const peerUserId = Number(body.peerUserId);
    if (!Number.isSafeInteger(peerUserId) || peerUserId < 1) throw Object.assign(new Error('A valid member id is required.'), { status: 400 });
    return send(response, 201, { conversation: chat.startDirect(user.id, peerUserId) });
  }
  if (method === 'GET' && path === '/chat/conversations') return send(response, 200, { conversations: chat.list(user.id) });
  const messagesPath = path.match(/^\/chat\/conversations\/([^/]+)\/messages$/);
  if (messagesPath) {
    const conversationId = decodeURIComponent(messagesPath[1]);
    if (method === 'GET') return send(response, 200, { messages: chat.messages(user.id, conversationId) });
    if (method === 'POST') {
      if (!rateLimit(`messages:${user.id}`)) return send(response, 429, { message: 'You are sending notes quickly. Take a short pause.' });
      const sent = chat.send(user.id, conversationId, validateMessage(body.body));
      if (sent.recipientUserId) {
        sendChatPush(db, sent.recipientUserId, user.name, conversationId).catch((error) => console.warn('Push delivery could not be queued:', error.message));
      }
      return send(response, 201, { message: sent.message });
    }
  }
  if (method === 'POST' && path === '/style/assistant') {
    return send(response, 200, { reply: await getStyleSuggestion(body.message, config) });
  }
  if (method === 'POST' && path === '/me/push-token') {
    if (typeof body.token !== 'string' || !body.token.startsWith('ExponentPushToken[')) throw Object.assign(new Error('A valid Expo push token is required.'), { status: 400 });
    if (!['ios', 'android'].includes(body.platform)) throw Object.assign(new Error('Platform must be ios or android.'), { status: 400 });
    db.prepare('INSERT INTO push_devices (user_id,push_token,platform,updated_at) VALUES (?,?,?,CURRENT_TIMESTAMP) ON CONFLICT(user_id,push_token) DO UPDATE SET platform=excluded.platform,updated_at=CURRENT_TIMESTAMP')
      .run(user.id, body.token, body.platform);
    return send(response, 204, null);
  }
  return send(response, 404, { message: 'Route not found.' });
}

const server = http.createServer((request, response) => {
  handle(request, response).catch((error) => {
    if (response.headersSent) { response.destroy(error); return; }
    send(response, error.status || 500, { message: error.status ? error.message : 'The server could not complete this request.' });
    if (!error.status) console.error(error);
  });
});
server.listen(config.port, config.host, () => {
  if (process.env.NODE_ENV !== 'production' && !process.env.JWT_SECRET) console.warn('Using a development JWT secret. Set JWT_SECRET before deploying.');
  console.log(`Zenvy API listening on http://${config.host}:${config.port}`);
});
for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => server.close(() => { db.close(); process.exit(0); }));
