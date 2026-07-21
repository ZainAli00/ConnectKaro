/**
 * src/services/authService.js
 *
 * Password hashing, JWT issue/verify, and credential lookup for AdminUser.
 * This is the only place in the app that touches JWT secrets or password
 * hashes directly — controllers/middleware call through these functions.
 *
 * Session revocation: AdminUser.tokenVersion is embedded in both the access
 * and refresh token payloads. Bumping that column (e.g. on password change,
 * or a future "log out everywhere" action) instantly invalidates every
 * previously issued refresh token without needing a blacklist table.
 */

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const { config } = require('../config/env');
const prisma = require('../prismaClient');

const SALT_ROUNDS = 12;

async function hashPassword(plain) {
  return bcrypt.hash(plain, SALT_ROUNDS);
}

async function comparePassword(plain, hash) {
  return bcrypt.compare(plain, hash);
}

function issueAccessToken(admin) {
  return jwt.sign(
    { sub: admin.id, email: admin.email, tokenVersion: admin.tokenVersion },
    config.jwt.accessSecret,
    { expiresIn: config.jwt.accessExpiresIn }
  );
}

function issueRefreshToken(admin) {
  return jwt.sign(
    { sub: admin.id, tokenVersion: admin.tokenVersion },
    config.jwt.refreshSecret,
    { expiresIn: config.jwt.refreshExpiresIn }
  );
}

function verifyAccessToken(token) {
  return jwt.verify(token, config.jwt.accessSecret);
}

function verifyRefreshToken(token) {
  return jwt.verify(token, config.jwt.refreshSecret);
}

/**
 * Looks up an AdminUser by email and checks the password. Returns null for
 * every failure case (no such admin, inactive admin, wrong password) so
 * callers can respond with one generic "invalid credentials" message
 * without leaking which part was wrong. On success, updates lastLoginAt and
 * returns the full admin record.
 */
async function verifyCredentials(email, password) {
  const admin = await prisma.adminUser.findUnique({ where: { email } });

  if (!admin || admin.isActive === false) {
    return null;
  }

  const passwordMatches = await comparePassword(password, admin.passwordHash);
  if (!passwordMatches) {
    return null;
  }

  return prisma.adminUser.update({
    where: { id: admin.id },
    data: { lastLoginAt: new Date() },
  });
}

function refreshTokenVersionMatches(admin, decodedTokenVersion) {
  return admin.tokenVersion === decodedTokenVersion;
}

module.exports = {
  hashPassword,
  comparePassword,
  issueAccessToken,
  issueRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  verifyCredentials,
  refreshTokenVersionMatches,
};
