/**
 * src/validators/publicLookup.schema.js
 *
 * zod schema for the public order-lookup route.
 */

const { z } = require('zod');

const lookupSchema = z.object({
  orderId: z.string().trim().min(5).max(20),
});

module.exports = { lookupSchema };
