/**
 * src/controllers/destinations.controller.js
 *
 * Handles GET /api/public/destinations — serves the static destination list
 * used by both the public lookup page and the admin order form. No
 * database-backed Destination model exists; see utils/constants.js.
 */

const asyncHandler = require('../utils/asyncHandler');
const { DESTINATIONS } = require('../utils/constants');

const list = asyncHandler(async (req, res) => {
  res.json({ success: true, data: DESTINATIONS });
});

module.exports = { list };
