import { NextResponse } from 'next/server';
import { checkinRequestSchema } from '@appbit/shared-schemas';
import { EMOJI_VALUES } from '@appbit/shared-types';
import { dbClient } from '@/src/server/clients/db.client';
import { getCurrentAuthUser } from '@/src/server/auth/get-current-auth-user';
import { findLinkedUsuario } from '@/src/server/auth/find-linked-usuario';
import { EstadoCheckinEmojiEnum, Prisma } from '@/src/server/generated/prisma';

export const dynamic = 'force-dynamic';

const checkinUsuarioSelect = {
  usuario_id: true,
} as const;

const EMOJI_ENUM_BY_REQUEST = {
  agotado: EstadoCheckinEmojiEnum.Agotado,
  triste: EstadoCheckinEmojiEnum.Triste,
  neutral: EstadoCheckinEmojiEnum.Neutral,
  bien: EstadoCheckinEmojiEnum.Bien,
  genial: EstadoCheckinEmojiEnum.Genial,
} as const;

class CheckinAlreadyExistsTodayError extends Error {
  constructor() {
    super('CHECKIN_ALREADY_EXISTS_TODAY');
    this.name = 'CheckinAlreadyExistsTodayError';
  }
}

function getTimeZoneOffsetMs(date: Date, timeZone: string) {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone,
    timeZoneName: 'shortOffset',
  });

  const timeZoneName = formatter
    .formatToParts(date)
    .find((part) => part.type === 'timeZoneName')?.value;

  if (!timeZoneName || timeZoneName === 'GMT') {
    return 0;
  }

  const match = timeZoneName.match(/^GMT([+-])(\d{1,2})(?::(\d{2}))?$/);

  if (!match) {
    return 0;
  }

  const sign = match[1] === '-' ? -1 : 1;
  const hours = Number(match[2] ?? 0);
  const minutes = Number(match[3] ?? 0);

  return sign * ((hours * 60 + minutes) * 60 * 1000);
}

function getUserDayRange(timeZone?: string) {
  const safeTimeZone = timeZone || 'UTC';

  try {
    new Intl.DateTimeFormat('en-US', {
      timeZone: safeTimeZone,
    }).format();

    const now = new Date();

    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone: safeTimeZone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).formatToParts(now);

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

    const startOffset = getTimeZoneOffsetMs(startLocalAsUtc, safeTimeZone);
    const endOffset = getTimeZoneOffsetMs(endLocalAsUtc, safeTimeZone);

    return {
      start: new Date(startLocalAsUtc.getTime() - startOffset),
      end: new Date(endLocalAsUtc.getTime() - endOffset),
    };
  } catch {
    const now = new Date();

    const start = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
    );

    const end = new Date(start);
    end.setUTCDate(end.getUTCDate() + 1);

    return { start, end };
  }
}

function alreadyExistsTodayResponse() {
  return NextResponse.json(
    {
      success: false,
      code: 'CHECKIN_ALREADY_EXISTS_TODAY',
      message: 'Ya registraste tu check-in de bienestar de hoy.',
    },
    { status: 409 },
  );
}

export async function POST(request: Request) {
  try {
    const authUser = await getCurrentAuthUser();

    if (!authUser) {
      return NextResponse.json(
        {
          success: false,
          message: 'Unauthorized',
        },
        { status: 401 },
      );
    }

    const usuario = await findLinkedUsuario(authUser, checkinUsuarioSelect);

    if (!usuario) {
      return NextResponse.json(
        {
          success: false,
          message: 'User not found. Complete onboarding first.',
        },
        { status: 404 },
      );
    }

    const rawBody = await request.json();
    const parsed = checkinRequestSchema.safeParse(rawBody);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          message: 'Datos inválidos',
          errors: parsed.error.flatten(),
        },
        { status: 400 },
      );
    }

    const { emoji, motivos, contexto, timezone } = parsed.data;
    const { start, end } = getUserDayRange(timezone);

    const emojiEnum = EMOJI_ENUM_BY_REQUEST[emoji];
    const notaDiaria = EMOJI_VALUES[emojiEnum];

    const result = await dbClient.$transaction(
      async (tx) => {
        const existingTodayCheckin = await tx.checkIns.findFirst({
          where: {
            usuario_id: usuario.usuario_id,
            creado_en: {
              gte: start,
              lt: end,
            },
          },
          select: {
            checkin_id: true,
          },
        });

        if (existingTodayCheckin) {
          throw new CheckinAlreadyExistsTodayError();
        }

        const checkin = await tx.checkIns.create({
          data: {
            usuario_id: usuario.usuario_id,
            emoji: emojiEnum,
            nota_diaria: notaDiaria,
          },
          select: {
            checkin_id: true,
          },
        });

        if (motivos.length > 0) {
          await tx.checkInMotivos.createMany({
            data: motivos.map((motivo) => ({
              checkin_id: checkin.checkin_id,
              motivo,
            })),
          });
        }

        const normalizedContexto = contexto?.trim();

        if (normalizedContexto) {
          await tx.checkInContexto.create({
            data: {
              checkin_id: checkin.checkin_id,
              contexto: normalizedContexto,
            },
          });
        }

        return checkin;
      },
      {
        maxWait: 10000,
        timeout: 15000,
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
      },
    );

    return NextResponse.json({
      success: true,
      checkinId: result.checkin_id,
    });
  } catch (error) {
    if (error instanceof CheckinAlreadyExistsTodayError) {
      return alreadyExistsTodayResponse();
    }

    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2034'
    ) {
      return alreadyExistsTodayResponse();
    }

    console.error('Error en checkin:', error);

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error ? error.message : 'Error interno del servidor',
      },
      { status: 500 },
    );
  }
}
