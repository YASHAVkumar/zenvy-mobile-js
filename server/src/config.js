const path = require('node:path');

function readConfig() {
  const jwtSecret = process.env.JWT_SECRET || 'local-development-only-change-this-secret';
  if (jwtSecret.length < 32) {
    throw new Error('JWT_SECRET must contain at least 32 characters.');
  }
  if (!process.env.JWT_SECRET && process.env.NODE_ENV === 'production') {
    throw new Error('JWT_SECRET must be configured in production.');
  }
  return {
    port: Number(process.env.PORT || 4000),
    host: process.env.HOST || '0.0.0.0',
    jwtSecret,
    allowedOrigin: process.env.CORS_ORIGIN || '*',
    databasePath: process.env.DATABASE_PATH || path.join(__dirname, '..', 'data', 'zenvy.sqlite'),
    styleAiUrl: process.env.STYLE_AI_URL || '',
    styleAiKey: process.env.STYLE_AI_API_KEY || '',
  };
}

module.exports = { readConfig };
