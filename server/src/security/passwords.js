const crypto = require('node:crypto');
const { promisify } = require('node:util');

const scrypt = promisify(crypto.scrypt);
async function hashPassword(password, salt = crypto.randomBytes(16).toString('hex')) {
  const derived = await scrypt(password, salt, 64);
  return { salt, hash: derived.toString('hex') };
}
async function verifyPassword(password, salt, expected) {
  const { hash } = await hashPassword(password, salt);
  const actualBuffer = Buffer.from(hash, 'hex');
  const expectedBuffer = Buffer.from(expected, 'hex');
  return actualBuffer.length === expectedBuffer.length && crypto.timingSafeEqual(actualBuffer, expectedBuffer);
}

module.exports = { hashPassword, verifyPassword };
