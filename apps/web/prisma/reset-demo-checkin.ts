import { PrismaPg } from '@prisma/adapter-pg';
import { config } from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { PrismaClient } from '../src/server/generated/prisma';

const DEMO_TIME_ZONE = 'America/Sao_Paulo';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

config({ path: path.resolve(__dirname, '../.env') });

const connectionString = process.env.DATABASE_URL ?? process.env.DIRECT_URL;
const demoEmail = process.env.DATASET_DEMO_EMAIL?.trim();

if (!connectionString) {
  throw new Error(
    'DATABASE_URL o DIRECT_URL es requerida para limpiar el check-in demo.',
  );
}

if (!demoEmail) {
  throw new Error(
    'DATASET_DEMO_EMAIL es requerida para limpiar el check-in demo.',
  );
}

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

function getTimeZoneOffsetMs(date: Date, timeZone: string) {
  const timeZoneName = new Intl.DateTimeFormat('en-US', {
    timeZone,
    timeZoneName: 'shortOffset',
  })
    .formatToParts(date)
    .find((part) => part.type === 'timeZoneName')?.value;

  if (!timeZoneName || timeZoneName === 'GMT') {
    return 0;
  }

  const match = timeZoneName.match(/^GMT([+-])(\d{1,2})(?::(\d{2}))?$/);

  if (!match) {
    throw new Error(`No se pudo resolver la zona horaria ${timeZone}.`);
  }

  const sign = match[1] === '-' ? -1 : 1;
  const hours = Number(match[2] ?? 0);
  const minutes = Number(match[3] ?? 0);

  return sign * (hours * 60 + minutes) * 60 * 1000;
}

function getDayRange(date: Date, timeZone: string) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date);
  const values = Object.fromEntries(
    parts
      .filter((part) => part.type !== 'literal')
      .map((part) => [part.type, part.value]),
  );
  const year = Number(values.year);
  const month = Number(values.month);
  const day = Number(values.day);
  const startLocalAsUtc = new Date(Date.UTC(year, month - 1, day));
  const endLocalAsUtc = new Date(Date.UTC(year, month - 1, day + 1));

  return {
    start: new Date(
      startLocalAsUtc.getTime() -
        getTimeZoneOffsetMs(startLocalAsUtc, timeZone),
    ),
    end: new Date(
      endLocalAsUtc.getTime() -
        getTimeZoneOffsetMs(endLocalAsUtc, timeZone),
    ),
  };
}

async function main() {
  const user = await prisma.usuarios.findUnique({
    where: { email: demoEmail },
    select: {
      usuario_id: true,
      email: true,
    },
  });

  if (!user) {
    throw new Error(`No existe un usuario de AppBiT con el correo ${demoEmail}.`);
  }

  const { start, end } = getDayRange(new Date(), DEMO_TIME_ZONE);
  const checkins = await prisma.checkIns.findMany({
    where: {
      usuario_id: user.usuario_id,
      creado_en: {
        gte: start,
        lt: end,
      },
    },
    select: {
      checkin_id: true,
      emoji: true,
      nota_diaria: true,
      creado_en: true,
      _count: {
        select: {
          motivos: true,
          contextos: true,
          respuestas_salud: true,
        },
      },
    },
  });

  if (checkins.length === 0) {
    console.log(
      `No hay un check-in de hoy para ${user.email} en ${DEMO_TIME_ZONE}.`,
    );
    return;
  }

  if (checkins.length !== 1) {
    throw new Error(
      `Se encontraron ${checkins.length} check-ins de hoy para ${user.email}. No se eliminó ninguno.`,
    );
  }

  const [checkin] = checkins;

  console.log('Check-in encontrado:', {
    checkinId: checkin.checkin_id,
    email: user.email,
    emoji: checkin.emoji,
    notaDiaria: Number(checkin.nota_diaria),
    creadoEn: checkin.creado_en.toISOString(),
    motivos: checkin._count.motivos,
    contextos: checkin._count.contextos,
    respuestasSalud: checkin._count.respuestas_salud,
  });

  const result = await prisma.$transaction(async (tx) => {
    const deletedResponses = await tx.respuestasSalud.deleteMany({
      where: { checkin_id: checkin.checkin_id },
    });

    await tx.checkIns.delete({
      where: { checkin_id: checkin.checkin_id },
    });

    return {
      checkins: 1,
      responses: deletedResponses.count,
      motivos: checkin._count.motivos,
      contextos: checkin._count.contextos,
    };
  });

  console.log('Limpieza completada:', result);
}

main()
  .catch((error) => {
    console.error('No se pudo limpiar el check-in demo:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
