/**
 * src/controllers/stats.controller.js
 *
 * Handles GET /api/admin/stats — dashboard aggregate numbers.
 */

const asyncHandler = require('../utils/asyncHandler');
const statsService = require('../services/statsService');

const get = asyncHandler(async (req, res) => {
  const data = await statsService.getDashboardStats();
  res.json({ success: true, data });
});

module.exports = { get };
