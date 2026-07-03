import { NextResponse } from 'next/server';
import { checkinRequestSchema } from '@appbit/shared-schemas';
import { EMOJI_VALUES } from '@appbit/shared-types/wellbeing';
import { dbClient } from '@/src/server/clients/db.client';
import { getCurrentAuthUser } from '@/src/server/auth/get-current-auth-user';
import { findLinkedUsuario } from '@/src/server/auth/find-linked-usuario';
import { EstadoCheckinEmojiEnum, Prisma } from '@/src/server/generated/prisma';

export const dynamic = 'force-dynamic';

const checkinUsuarioSelect = {
  usuario_id: true,
} as const;

function normalizeEmoji(emoji: string) {
  return emoji.charAt(0).toUpperCase() + emoji.slice(1).toLowerCase();
}

export async function POST(request: Request) {
  try {
    const authUser = await getCurrentAuthUser();

    if (!authUser) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 },
      );
    }

    const rawBody = await request.json();
    const parsed = checkinRequestSchema.safeParse(rawBody);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          message: 'Datos inválidos',
          errors: parsed.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    const usuario = await findLinkedUsuario(authUser, checkinUsuarioSelect);

    if (!usuario) {
      return NextResponse.json(
        {
          success: false,
          message: 'Usuario no encontrado. Complete onboarding first.',
        },
        { status: 404 },
      );
    }

    const { emoji, motivos, contexto } = parsed.data;

    const emojiNormalized = normalizeEmoji(emoji);

    if (
      !Object.values(EstadoCheckinEmojiEnum).includes(
        emojiNormalized as EstadoCheckinEmojiEnum,
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          message: 'Emoji no válido para el sistema',
        },
        { status: 400 },
      );
    }

    const emojiEnum = emojiNormalized as EstadoCheckinEmojiEnum;
    const notaDiaria = EMOJI_VALUES[emojiEnum as keyof typeof EMOJI_VALUES];

    const result = await dbClient.$transaction(async (tx) => {
      const checkin = await tx.checkIns.create({
        data: {
          usuario_id: usuario.usuario_id,
          emoji: emojiEnum,
          nota_diaria: new Prisma.Decimal(notaDiaria),
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

      const trimmedContexto = contexto?.trim();

      if (trimmedContexto) {
        await tx.checkInContexto.create({
          data: {
            checkin_id: checkin.checkin_id,
            contexto: trimmedContexto,
          },
        });
      }

      return checkin;
    });

    return NextResponse.json({
      success: true,
      message: 'Check-in creado exitosamente',
      checkinId: result.checkin_id,
    });
  } catch (error) {
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
