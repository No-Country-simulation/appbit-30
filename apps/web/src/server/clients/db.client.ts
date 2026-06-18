// apps/web/src/server/clients/db.client.ts
import { PrismaClient } from '../../../src/server/generated/prisma';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

// Evita que Next.js cree múltiples conexiones a la base de datos cada vez que recarga el código en desarrollo
export const dbClient = globalForPrisma.prisma || new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = dbClient;