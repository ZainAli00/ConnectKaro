/**
 * src/routes/admin/orders.routes.js
 *
 * GET    /api/admin/orders
 * POST   /api/admin/orders
 * GET    /api/admin/orders/:id
 * PATCH  /api/admin/orders/:id
 * DELETE /api/admin/orders/:id
 *
 * Every route here requires an authenticated admin session.
 */

const express = require('express');

const requireAuth = require('../../middleware/requireAuth');
const { validate } = require('../../middleware/validateRequest');
const {
  createOrderSchema,
  updateOrderSchema,
  listOrdersQuerySchema,
} = require('../../validators/order.schema');
const controller = require('../../controllers/orders.controller');

const router = express.Router();

router.use(requireAuth);

router.get('/', validate({ query: listOrdersQuerySchema }), controller.list);
router.post('/', validate({ body: createOrderSchema }), controller.create);
router.get('/:id', controller.get);
router.patch('/:id', validate({ body: updateOrderSchema }), controller.update);
router.delete('/:id', controller.remove);
router.post('/:id/refresh-usage', controller.refreshUsage);

module.exports = router;
