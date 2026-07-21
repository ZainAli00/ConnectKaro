/**
 * src/validators/auth.schema.js
 *
 * zod schemas for the admin auth routes.
 */

const { z } = require('zod');

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

module.exports = { loginSchema };
