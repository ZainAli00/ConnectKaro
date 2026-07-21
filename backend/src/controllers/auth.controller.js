/**
 * src/controllers/auth.controller.js
 *
 * Thin handlers for /api/admin/auth/*. Business logic (credential checks,
 * token issuance/verification) lives in services/authService.js; this file
 * only translates HTTP <-> service calls.
 */

const { config } = require('../config/env');
const asyncHandler = require('../utils/asyncHandler');
const { msFromDuration } = require('../utils/duration');
const authService = require('../services/authService');
const prisma = require('../prismaClient');

const REFRESH_COOKIE_NAME = 'ck_refresh';
const REFRESH_COOKIE_PATH = '/api/admin/auth';

function refreshCookieOptions() {
  return {
    httpOnly: true,
    path: REFRESH_COOKIE_PATH,
    sameSite: 'lax',
    secure: config.isProduction,
    maxAge: msFromDuration(config.jwt.refreshExpiresIn),
  };
}

function toPublicAdmin(admin) {
  return { id: admin.id, email: admin.email, displayName: admin.displayName };
}

function setRefreshCookie(res, admin) {
  const refreshToken = authService.issueRefreshToken(admin);
  res.cookie(REFRESH_COOKIE_NAME, refreshToken, refreshCookieOptions());
}

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const admin = await authService.verifyCredentials(email, password);
  if (!admin) {
    throw { statusCode: 401, publicMessage: 'Invalid email or password.' };
  }

  const accessToken = authService.issueAccessToken(admin);
  setRefreshCookie(res, admin);

  res.json({
    success: true,
    accessToken,
    admin: toPublicAdmin(admin),
  });
});

const refresh = asyncHandler(async (req, res) => {
  const token = req.cookies ? req.cookies[REFRESH_COOKIE_NAME] : undefined;

  if (!token) {
    throw { statusCode: 401, publicMessage: 'Session expired. Please log in again.' };
  }

  let decoded;
  try {
    decoded = authService.verifyRefreshToken(token);
  } catch (err) {
    throw { statusCode: 401, publicMessage: 'Session expired. Please log in again.' };
  }

  const admin = await prisma.adminUser.findUnique({ where: { id: decoded.sub } });

  if (!admin || admin.isActive === false) {
    throw { statusCode: 401, publicMessage: 'Session expired. Please log in again.' };
  }

  if (!authService.refreshTokenVersionMatches(admin, decoded.tokenVersion)) {
    throw { statusCode: 401, publicMessage: 'Session expired. Please log in again.' };
  }

  const accessToken = authService.issueAccessToken(admin);
  setRefreshCookie(res, admin);

  res.json({ success: true, accessToken });
});

const logout = asyncHandler(async (req, res) => {
  res.clearCookie(REFRESH_COOKIE_NAME, {
    httpOnly: true,
    path: REFRESH_COOKIE_PATH,
    sameSite: 'lax',
    secure: config.isProduction,
  });

  res.json({ success: true });
});

const me = asyncHandler(async (req, res) => {
  const admin = await prisma.adminUser.findUnique({ where: { id: req.admin.id } });

  if (!admin) {
    throw { statusCode: 401, publicMessage: 'Session expired. Please log in again.' };
  }

  res.json({ success: true, admin: toPublicAdmin(admin) });
});

module.exports = { login, refresh, logout, me };
