-- Repair drift: staging_assinantes was removed from the database outside Prisma migrations.
-- Keep this migration idempotent so it is safe across environments.

DROP TABLE IF EXISTS "staging_assinantes";
