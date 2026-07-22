import { NextResponse } from 'next/server';
import { checkinRequestSchema } from '@appbit/shared-schemas';
import { EMOJI_VALUES } from '@appbit/shared-types';
import { dbClient } from '@/src/server/clients/db.client';
import { getCurrentAuthUser } from '@/src/server/auth/get-current-auth-user';
import { findLinkedUsuario } from '@/src/server/auth/find-linked-usuario';
import { EstadoCheckinEmojiEnum, Prisma } from '@/src/server/generated/prisma';

export const dynamic = 'force-dynamic';

type AppLocale = 'es' | 'pt';

const checkinUsuarioSelect = {
  usuario_id: true,
  idioma_app: true,
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

type WellbeingAnalysis = {
  nota_actual: number;
  nota_semanal: number;
  mensaje: string;
  accion_sugerida: string;
  derivar_cvv: boolean;
  alerta: boolean;
};

function getRequestLocale(request: Request): AppLocale | null {
  const rawLocale = request.headers.get('x-locale');

  if (rawLocale === 'pt') return 'pt';
  if (rawLocale === 'es') return 'es';

  return null;
}

function toFiniteNumber(value: unknown, fallback: number) {
  const numberValue = Number(value);

  return Number.isFinite(numberValue) ? numberValue : fallback;
}

function getNotaDiaria(emoji: keyof typeof EMOJI_ENUM_BY_REQUEST) {
  const emojiEnum = EMOJI_ENUM_BY_REQUEST[emoji];
  const values = EMOJI_VALUES as Record<string, number>;

  return values[emoji] ?? values[emojiEnum] ?? 5;
}

function getFallbackWellbeingAnalysis(params: {
  locale: AppLocale;
  notaActual: number;
  historialSemanal: number[];
}): WellbeingAnalysis {
  const { locale, notaActual, historialSemanal } = params;

  const notas = [...historialSemanal, notaActual];
  const notaSemanal =
    notas.length > 0
      ? Number(
          (notas.reduce((sum, value) => sum + value, 0) / notas.length).toFixed(
            2,
          ),
        )
      : notaActual;

  const alerta = notaSemanal < 5.5;
  const derivarCvv = notaSemanal < 4;

  return {
    nota_actual: notaActual,
    nota_semanal: notaSemanal,
    mensaje:
      locale === 'pt'
        ? 'Obrigado por compartilhar como você se sente hoje.'
        : 'Gracias por compartir cómo te sentís hoy.',
    accion_sugerida:
      locale === 'pt'
        ? 'Faça uma pausa breve, respire fundo e escolha uma próxima ação pequena.'
        : 'Hacé una pausa breve, respirá profundo y elegí una próxima acción pequeña.',
    derivar_cvv: derivarCvv,
    alerta,
  };
}

async function analyzeWellbeing(params: {
  userId: string;
  locale: AppLocale;
  emoji: EstadoCheckinEmojiEnum;
  notaActual: number;
  motivos: string[];
  contexto?: string;
  historialSemanal: number[];
}): Promise<{
  analysis: WellbeingAnalysis;
  source: 'ai' | 'fallback';
}> {
  const aiServiceUrl = process.env.AI_SERVICE_URL;

  if (!aiServiceUrl) {
    return {
      analysis: getFallbackWellbeingAnalysis({
        locale: params.locale,
        notaActual: params.notaActual,
        historialSemanal: params.historialSemanal,
      }),
      source: 'fallback',
    };
  }

  try {
    const response = await fetch(`${aiServiceUrl}/wellbeing/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-locale': params.locale,
      },
      body: JSON.stringify({
        userId: params.userId,
        emoji: params.emoji,
        nota_diaria: params.notaActual,
        motivo:
          params.motivos.length > 0 ? params.motivos.join(', ') : undefined,
        contexto: params.contexto,
        historial_semanal: params.historialSemanal,
        idioma: params.locale,
      }),
      signal: AbortSignal.timeout(15000),
    });

    const rawText = await response.text().catch(() => '');

    if (!response.ok) {
      console.warn(
        JSON.stringify({
          level: 'warn',
          route: 'POST /api/checkins',
          message:
            'AI wellbeing service returned non-OK response; using fallback',
          context: {
            status: response.status,
            statusText: response.statusText,
            responseBody: rawText.slice(0, 2000),
          },
        }),
      );

      return {
        analysis: getFallbackWellbeingAnalysis({
          locale: params.locale,
          notaActual: params.notaActual,
          historialSemanal: params.historialSemanal,
        }),
        source: 'fallback',
      };
    }

    const parsed = JSON.parse(rawText) as Partial<WellbeingAnalysis>;

    if (
      typeof parsed.mensaje !== 'string' ||
      typeof parsed.accion_sugerida !== 'string'
    ) {
      throw new Error('Invalid AI wellbeing response shape');
    }

    return {
      analysis: {
        nota_actual: toFiniteNumber(parsed.nota_actual, params.notaActual),
        nota_semanal: toFiniteNumber(parsed.nota_semanal, params.notaActual),
        mensaje: parsed.mensaje,
        accion_sugerida: parsed.accion_sugerida,
        derivar_cvv: Boolean(parsed.derivar_cvv),
        alerta: Boolean(parsed.alerta),
      },
      source: 'ai',
    };
  } catch (error) {
    console.error(
      JSON.stringify({
        level: 'error',
        route: 'POST /api/checkins',
        message: 'AI wellbeing service failed; using fallback',
        error:
          error instanceof Error
            ? {
                name: error.name,
                message: error.message,
                stack: error.stack,
              }
            : String(error),
      }),
    );

    return {
      analysis: getFallbackWellbeingAnalysis({
        locale: params.locale,
        notaActual: params.notaActual,
        historialSemanal: params.historialSemanal,
      }),
      source: 'fallback',
    };
  }
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

    const requestLocale = getRequestLocale(request);
    const responseLocale: AppLocale =
      requestLocale ?? (usuario.idioma_app === 'pt' ? 'pt' : 'es');

    const sevenDaysAgo = new Date(start);
    sevenDaysAgo.setUTCDate(sevenDaysAgo.getUTCDate() - 6);

    const historialSemanal = await dbClient.checkIns.findMany({
      where: {
        usuario_id: usuario.usuario_id,
        creado_en: {
          gte: sevenDaysAgo,
          lt: start,
        },
      },
      orderBy: {
        creado_en: 'asc',
      },
      select: {
        nota_diaria: true,
      },
    });

    const historialNotas = historialSemanal.map((item) =>
      Number(item.nota_diaria),
    );

    const emojiEnum = EMOJI_ENUM_BY_REQUEST[emoji];
    const notaDiaria = getNotaDiaria(emoji);

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

    const { analysis, source } = await analyzeWellbeing({
      userId: usuario.usuario_id,
      locale: responseLocale,
      emoji: emojiEnum,
      notaActual: Number(notaDiaria),
      motivos,
      contexto: contexto?.trim(),
      historialSemanal: historialNotas,
    });

    try {
      await dbClient.respuestasSalud.create({
        data: {
          usuario_id: usuario.usuario_id,
          checkin_id: result.checkin_id,
          nota_actual: analysis.nota_actual,
          nota_semanal: analysis.nota_semanal,
          mensaje: analysis.mensaje,
          accion_sugerida: analysis.accion_sugerida,
          derivar_cvv: analysis.derivar_cvv,
          alerta: analysis.alerta,
        },
      });
    } catch (error) {
      console.error(
        JSON.stringify({
          level: 'error',
          route: 'POST /api/checkins',
          message: 'Failed to persist wellbeing AI response',
          error:
            error instanceof Error
              ? {
                  name: error.name,
                  message: error.message,
                  stack: error.stack,
                }
              : String(error),
          context: {
            usuarioId: usuario.usuario_id,
            checkinId: result.checkin_id,
          },
        }),
      );
    }

    return NextResponse.json({
      success: true,
      checkinId: result.checkin_id,
      wellbeing: {
        ...analysis,
        source,
      },
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
