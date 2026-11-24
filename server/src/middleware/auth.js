const { verifyToken } = require('../security/jwt');

function requireUser(db, secret) {
  return (request) => {
    const authorization = request.headers.authorization || '';
    const [scheme, token] = authorization.split(' ');
    if (scheme !== 'Bearer' || !token) throw Object.assign(new Error('Sign in to continue.'), { status: 401 });
    const claims = verifyToken(token, secret);
    if (!claims) throw Object.assign(new Error('Your session expired. Sign in again.'), { status: 401 });
    const user = db.prepare('SELECT id,name,email FROM users WHERE id = ?').get(Number(claims.sub));
    if (!user) throw Object.assign(new Error('Your account is no longer available.'), { status: 401 });
    return user;
  };
}

module.exports = { requireUser };
