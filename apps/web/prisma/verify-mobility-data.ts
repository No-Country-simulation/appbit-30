import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/server/generated/prisma';

const connectionString = process.env.DATABASE_URL ?? process.env.DIRECT_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL o DIRECT_URL es requerida.');
}

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  const [profile, antennas, directDistance, reverseDistance] =
    await Promise.all([
      prisma.perfilMovilidad.findFirst({
        where: { home_cluster: 'CBD_BEIRAMAR' },
        select: { home_cluster: true, home_municipio: true },
      }),
      prisma.antenas.findMany({
        where: {
          cluster: { in: ['CBD_BEIRAMAR', 'CENTRO_HISTORICO'] },
        },
        select: { cluster: true, municipio: true },
        distinct: ['cluster'],
        orderBy: { cluster: 'asc' },
      }),
      prisma.distanciasCluster.findUnique({
        where: {
          cluster_origem_cluster_destino: {
            cluster_origem: 'CBD_BEIRAMAR',
            cluster_destino: 'CENTRO_HISTORICO',
          },
        },
        select: { dist_media_km: true },
      }),
      prisma.distanciasCluster.findUnique({
        where: {
          cluster_origem_cluster_destino: {
            cluster_origem: 'CENTRO_HISTORICO',
            cluster_destino: 'CBD_BEIRAMAR',
          },
        },
        select: { dist_media_km: true },
      }),
    ]);

  console.log(
    JSON.stringify(
      {
        profile,
        antennas,
        directDistanceKm: directDistance
          ? Number(directDistance.dist_media_km)
          : null,
        reverseDistanceKm: reverseDistance
          ? Number(reverseDistance.dist_media_km)
          : null,
      },
      null,
      2,
    ),
  );
}

main()
  .catch((error) => {
    console.error('No se pudo verificar el dataset de movilidad:', error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
