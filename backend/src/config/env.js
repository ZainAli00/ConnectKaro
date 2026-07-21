/**
 * src/config/env.js
 *
 * Single source of truth for process.env. Parses and validates every
 * variable listed in backend/.env.example with zod, once, at import time.
 * If validation fails we fail fast (console.error + process.exit(1)) rather
 * than letting the app boot into a half-configured state.
 *
 * Everything else in the app should import { config } from here instead of
 * touching process.env directly.
 */

const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '..', '..', '.env') });

const { z } = require('zod');

const envSchema = z.object({
  // --- Server ---
  PORT: z.coerce.number().int().positive().default(4000),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),

  // --- Database ---
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),

  // --- CORS ---
  // Comma-separated list of allowed origins; split into an array by config.corsAllowedOrigins below.
  CORS_ALLOWED_ORIGINS: z.string().min(1, 'CORS_ALLOWED_ORIGINS is required'),

  // --- Auth ---
  JWT_ACCESS_SECRET: z.string().min(1, 'JWT_ACCESS_SECRET is required'),
  JWT_ACCESS_EXPIRES_IN: z.string().min(1, 'JWT_ACCESS_EXPIRES_IN is required'),
  JWT_REFRESH_SECRET: z.string().min(1, 'JWT_REFRESH_SECRET is required'),
  JWT_REFRESH_EXPIRES_IN: z.string().min(1, 'JWT_REFRESH_EXPIRES_IN is required'),

  // --- Seed admin (only prisma/seed.js strictly requires these; optional here) ---
  SEED_ADMIN_EMAIL: z.string().optional(),
  SEED_ADMIN_PASSWORD: z.string().optional(),
  SEED_ADMIN_NAME: z.string().optional(),

  // --- eSIM provider selection ---
  // "mock" uses in-repo fixture data; "live" activates the real reseller
  // integration (see services/esimProvider/index.js). The reseller's
  // identity is intentionally not spelled out here — see CLAUDE.md.
  ESIM_PROVIDER: z.enum(['mock', 'live']).default('mock'),
  ESIM_SUPPLIER_BASE_URL: z.string().optional().default(''),
  ESIM_SUPPLIER_API_KEY: z.string().optional().default(''),
  ESIM_SUPPLIER_ACCESS_TOKEN: z.string().optional().default(''),

  // --- Usage cache ---
  USAGE_CACHE_TTL_SECONDS: z.coerce.number().int().positive().default(300),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('[config/env] Invalid environment configuration:');
  for (const issue of parsed.error.issues) {
    console.error(`  - ${issue.path.join('.')}: ${issue.message}`);
  }
  process.exit(1);
}

const env = parsed.data;

const config = Object.freeze({
  port: env.PORT,
  nodeEnv: env.NODE_ENV,
  isProduction: env.NODE_ENV === 'production',

  databaseUrl: env.DATABASE_URL,

  corsAllowedOrigins: env.CORS_ALLOWED_ORIGINS.split(',')
    .map((origin) => origin.trim())
    .filter(Boolean),

  jwt: Object.freeze({
    accessSecret: env.JWT_ACCESS_SECRET,
    accessExpiresIn: env.JWT_ACCESS_EXPIRES_IN,
    refreshSecret: env.JWT_REFRESH_SECRET,
    refreshExpiresIn: env.JWT_REFRESH_EXPIRES_IN,
  }),

  seedAdmin: Object.freeze({
    email: env.SEED_ADMIN_EMAIL,
    password: env.SEED_ADMIN_PASSWORD,
    displayName: env.SEED_ADMIN_NAME,
  }),

  esimProvider: env.ESIM_PROVIDER,
  esimSupplier: Object.freeze({
    baseUrl: env.ESIM_SUPPLIER_BASE_URL,
    apiKey: env.ESIM_SUPPLIER_API_KEY,
    accessToken: env.ESIM_SUPPLIER_ACCESS_TOKEN,
  }),

  usageCacheTtlSeconds: env.USAGE_CACHE_TTL_SECONDS,
});

module.exports = { config };
