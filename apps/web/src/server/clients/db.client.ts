// apps/web/src/server/clients/db.client.ts
import { PrismaClient } from '../../../src/server/generated/prisma';
import { PrismaPg } from '@prisma/adapter-pg';

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

// En Prisma v7 se requiere adapter explícito con el engine "client"
const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL!;
const adapter = new PrismaPg(connectionString);

// Evita que Next.js cree múltiples conexiones a la base de datos cada vez que recarga el código en desarrollo
export const dbClient =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
    log:
      process.env.NODE_ENV === 'development'
        ? ['query', 'error', 'warn']
        : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = dbClient;
}
