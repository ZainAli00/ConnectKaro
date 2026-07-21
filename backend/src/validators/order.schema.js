/**
 * src/validators/order.schema.js
 *
 * zod schemas for the admin orders routes.
 */

const { z } = require('zod');

const createOrderSchema = z.object({
  iccid: z.string().min(15).max(24),
  customerName: z.string().min(1),
  customerContact: z.string().min(1),
  destinationCode: z.string().min(1),
  planLabel: z.string().min(1),
  notes: z.string().optional(),
});

// iccid and orderId are assigned once at creation and are never editable
// afterwards, so iccid is omitted from this schema entirely (not merely
// marked optional) and orderId never appears in it at all.
const updateOrderSchema = z.object({
  customerName: z.string().min(1).optional(),
  customerContact: z.string().min(1).optional(),
  destinationCode: z.string().min(1).optional(),
  planLabel: z.string().min(1).optional(),
  notes: z.string().optional(),
  status: z.enum(['ACTIVE', 'CANCELLED']).optional(),
});

const listOrdersQuerySchema = z.object({
  query: z.string().optional(),
  status: z.enum(['ACTIVE', 'CANCELLED']).optional(),
  destinationCode: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});

module.exports = { createOrderSchema, updateOrderSchema, listOrdersQuerySchema };
