/**
 * prisma/seed.js
 *
 * Creates (or updates) exactly one AdminUser from env vars. There is no public
 * registration route by design — this script is the only way to provision an
 * admin account. Safe to re-run: it upserts by email.
 *
 * Required env vars (loaded from backend/.env):
 *   SEED_ADMIN_EMAIL
 *   SEED_ADMIN_PASSWORD
 *   SEED_ADMIN_NAME
 */

const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });

const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');

const SALT_ROUNDS = 12;

async function main() {
  const email = process.env.SEED_ADMIN_EMAIL;
  const password = process.env.SEED_ADMIN_PASSWORD;
  const displayName = process.env.SEED_ADMIN_NAME;

  const missing = [];
  if (!email) missing.push('SEED_ADMIN_EMAIL');
  if (!password) missing.push('SEED_ADMIN_PASSWORD');
  if (!displayName) missing.push('SEED_ADMIN_NAME');

  if (missing.length > 0) {
    console.error(
      `[seed] Missing required env var(s): ${missing.join(', ')}. ` +
        'Set them in backend/.env before running the seed script.'
    );
    process.exit(1);
  }

  const prisma = new PrismaClient();

  try {
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    const admin = await prisma.adminUser.upsert({
      where: { email },
      update: {
        passwordHash,
        displayName,
        isActive: true,
      },
      create: {
        email,
        passwordHash,
        displayName,
      },
    });

    console.log(
      `[seed] Success: admin user "${admin.email}" (id: ${admin.id}) is ready.`
    );
  } catch (err) {
    console.error('[seed] Failed to seed admin user:', err.message || err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
