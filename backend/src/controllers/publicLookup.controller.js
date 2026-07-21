/**
 * src/controllers/publicLookup.controller.js
 *
 * Handles POST /api/public/lookup — the only way a customer can see their
 * eSIM usage. req.body.orderId has already been validated (see
 * validators/publicLookup.schema.js + validateRequest middleware) by the
 * time this runs.
 *
 * Order lookups deliberately use one generic "not found" message no matter
 * why the order can't be resolved, so a garbage/malformed order ID and a
 * well-formed-but-nonexistent one are indistinguishable to a caller trying
 * to enumerate valid order IDs.
 */

const asyncHandler = require('../utils/asyncHandler');
const orderService = require('../services/orderService');
const usageSyncService = require('../services/usageSyncService');

const ORDER_NOT_FOUND_MESSAGE = 'Order not found. Please check the ID and try again.';

const lookup = asyncHandler(async (req, res) => {
  const { orderId } = req.body;

  let order;
  try {
    order = await orderService.getOrderByOrderId(orderId);
  } catch (err) {
    // Re-thrown with the same generic message regardless of the underlying
    // cause, so this endpoint never leaks whether an order ID was
    // well-formed-but-missing vs. otherwise invalid.
    throw { statusCode: 404, publicMessage: ORDER_NOT_FOUND_MESSAGE };
  }

  // Any EsimProviderError thrown from here already carries a safe,
  // connectkro-branded publicMessage (see esimProvider/errors.js) — let it
  // bubble up to asyncHandler/errorHandler as-is.
  const syncedOrder = await usageSyncService.syncIfStale(order);

  res.json({ success: true, data: usageSyncService.toPublicUsageShape(syncedOrder) });
});

module.exports = { lookup };
