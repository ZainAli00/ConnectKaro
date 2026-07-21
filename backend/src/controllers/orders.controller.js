/**
 * src/controllers/orders.controller.js
 *
 * Thin asyncHandler-wrapped handlers for /api/admin/orders. Business logic
 * lives in services/orderService.js; this file only translates HTTP <->
 * service calls.
 */

const asyncHandler = require('../utils/asyncHandler');
const orderService = require('../services/orderService');
const usageSyncService = require('../services/usageSyncService');

const list = asyncHandler(async (req, res) => {
  const { items, total, page, pageSize } = await orderService.listOrders(req.query);
  const data = items.map((order) => usageSyncService.toAdminUsageShape(order));
  res.json({ success: true, data, meta: { total, page, pageSize } });
});

const create = asyncHandler(async (req, res) => {
  const order = await orderService.createOrder({
    ...req.body,
    createdByAdminId: req.admin.id,
  });
  res.status(201).json({ success: true, data: usageSyncService.toAdminUsageShape(order) });
});

const get = asyncHandler(async (req, res) => {
  const order = await orderService.getOrderById(req.params.id);
  const syncedOrder = await usageSyncService.syncIfStale(order);
  res.json({ success: true, data: usageSyncService.toAdminUsageShape(syncedOrder) });
});

const update = asyncHandler(async (req, res) => {
  const order = await orderService.updateOrder(req.params.id, req.body);
  res.json({ success: true, data: usageSyncService.toAdminUsageShape(order) });
});

const remove = asyncHandler(async (req, res) => {
  await orderService.softDeleteOrder(req.params.id);
  res.json({ success: true, data: { id: req.params.id } });
});

const refreshUsage = asyncHandler(async (req, res) => {
  const order = await orderService.getOrderById(req.params.id);
  const updatedOrder = await usageSyncService.forceRefresh(order);
  res.json({ success: true, data: usageSyncService.toAdminUsageShape(updatedOrder) });
});

module.exports = { list, create, get, update, remove, refreshUsage };
