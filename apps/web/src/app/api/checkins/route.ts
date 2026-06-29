import { NextResponse } from 'next/server';
import { dbClient } from '@/src/server/clients/db.client';
import { getCurrentAuthUser } from '@/src/server/auth/get-current-auth-user';
import { checkinRequestSchema } from '@appbit/shared-schemas';
import {
    EMOJI_VALUES,
} from '@appbit/shared-types/wellbeing';
import { EstadoCheckinEmojiEnum } from '@/src/server/generated/prisma';

// ------------------------------------------------------
// NORMALIZACIÓN
// ------------------------------------------------------
function normalizeEmoji(emoji: string) {
    return emoji.charAt(0).toUpperCase() + emoji.slice(1).toLowerCase();
}

export const dynamic = 'force-dynamic';

// ------------------------------------------------------
// POST /api/checkins
// ------------------------------------------------------
export async function POST(request: Request) {
    try {
        const authUser = await getCurrentAuthUser();

        if (!authUser) {
            return NextResponse.json(
                { success: false, message: 'Unauthorized' },
                { status: 401 },
            );
        }

        if (!authUser.email) {
            return NextResponse.json(
                { success: false, message: 'Usuario sin email' },
                { status: 400 },
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

        const nota_diaria =
            EMOJI_VALUES[emoji as keyof typeof EMOJI_VALUES];

        const result = await dbClient.$transaction(async (tx) => {
                const usuario = await tx.usuarios.findUnique({
                    where: { email: authUser.email },
                });

                if (!usuario) {
                    throw new Error('Usuario no encontrado');
                }

                const checkin = await tx.checkIns.create({
                    data: {
                        usuario_id: usuario.usuario_id,
                        emoji: emojiNormalized as EstadoCheckinEmojiEnum,
                        nota_diaria,
                    },
                });

                if (motivos.length > 0) {
                    await tx.checkInMotivos.createMany({
                        data: motivos.map((motivo: string) => ({
                            checkin_id: checkin.checkin_id,
                            motivo,
                        })),
                    });
                }

                if (contexto) {
                    await tx.checkInContexto.create({
                        data: {
                            checkin_id: checkin.checkin_id,
                            contexto,
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
                    error instanceof Error
                        ? error.message
                        : 'Error interno del servidor',
            },
            { status: 500 },
        );
    }
}