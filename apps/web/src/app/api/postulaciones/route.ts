import { NextResponse } from 'next/server';
import { postulacionRequestSchema } from '@appbit/shared-schemas';
import { dbClient } from '@/src/server/clients/db.client';
import { getCurrentAuthUser } from '@/src/server/auth/get-current-auth-user';
import { findLinkedUsuario } from '@/src/server/auth/find-linked-usuario';
import { Prisma } from '@/src/server/generated/prisma';
import {
  apiErrorResponse,
  getRequestId,
  logApiError,
} from '@/src/server/api/api-error';
import {
  estadoLabels,
  getLabel,
} from '@/src/lib/label-helpers';

export const dynamic = 'force-dynamic';

const postulacionUsuarioSelect = {
  usuario_id: true,
} as const;

function formatDate(date: Date): string {
  return date.toLocaleDateString('es-AR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function calcularMatchPorcentaje(
  requisitos: { habilidad_id: string }[],
  userSkills: { habilidad_id: string }[],
): number {
  if (requisitos.length === 0) return 0;
  const userSkillIds = new Set(userSkills.map((s) => s.habilidad_id));
  const matches = requisitos.filter((r) => userSkillIds.has(r.habilidad_id)).length;
  return Math.round((matches / requisitos.length) * 100);
}

export async function GET(request: Request) {
  const requestId = getRequestId(request);

  try {
    const authUser = await getCurrentAuthUser();

    if (!authUser) {
      return apiErrorResponse({
        status: 401,
        code: 'UNAUTHORIZED',
        message: 'Necesitás iniciar sesión para ver tus postulaciones.',
        requestId,
      });
    }

    const usuario = await findLinkedUsuario(authUser, postulacionUsuarioSelect);

    if (!usuario) {
      return apiErrorResponse({
        status: 404,
        code: 'USER_NOT_FOUND',
        message: 'No encontramos tu perfil. Completá el onboarding para continuar.',
        requestId,
      });
    }

    const postulaciones = await dbClient.postulaciones.findMany({
      where: { usuario_id: usuario.usuario_id },
      include: {
        vacante: {
          include: {
            empresa: {
              select: {
                nombre: true,
                logo_url: true,
              },
            },
          },
        },
      },
      orderBy: { creado_en: 'desc' },
    });

    const formatted = postulaciones.map((p) => ({
      id: p.postulacion_id,
      titulo: p.vacante.titulo,
      empresa: p.vacante.empresa.nombre,
      logoUrl: p.vacante.empresa.logo_url,
      estado: getLabel(estadoLabels, p.estado, p.estado),
      matchPorcentaje: p.match_porcentaje ? Number(p.match_porcentaje) : null,
      feedback: null,
      skillRechazada: null,
      mensajesNuevos: 0,
      creadoEn: formatDate(p.creado_en),
    }));

    return NextResponse.json({ postulaciones: formatted });
  } catch (error) {
    logApiError({
      route: 'GET /api/postulaciones',
      requestId,
      error,
      context: { code: 'POSTULACIONES_FETCH_FAILED' },
    });

    return apiErrorResponse({
      status: 500,
      code: 'POSTULACIONES_FETCH_FAILED',
      message: 'No pudimos cargar tus postulaciones. Intentá de nuevo.',
      requestId,
    });
  }
}

export async function POST(request: Request) {
  const requestId = getRequestId(request);

  try {
    const authUser = await getCurrentAuthUser();

    if (!authUser) {
      return apiErrorResponse({
        status: 401,
        code: 'UNAUTHORIZED',
        message: 'Necesitás iniciar sesión para postularte.',
        requestId,
      });
    }

    const rawBody = await request.json();
    const parsed = postulacionRequestSchema.safeParse(rawBody);

    if (!parsed.success) {
      return apiErrorResponse({
        status: 400,
        code: 'VALIDATION_ERROR',
        message: 'Datos inválidos',
        requestId,
        details: {
          fieldErrors: parsed.error.flatten().fieldErrors,
        },
      });
    }

    const usuario = await findLinkedUsuario(authUser, postulacionUsuarioSelect);

    if (!usuario) {
      return apiErrorResponse({
        status: 404,
        code: 'USER_NOT_FOUND',
        message: 'No encontramos tu perfil. Completá el onboarding para continuar.',
        requestId,
      });
    }

    const { vacante_id, mensaje_motivacion, usar_cv_guardado } = parsed.data;

    const vacante = await dbClient.vacantes.findUnique({
      where: { vacante_id },
      select: {
        activa: true,
        requisitos: {
          select: { habilidad_id: true },
        },
      },
    });

    if (!vacante) {
      return apiErrorResponse({
        status: 404,
        code: 'VACANTE_NOT_FOUND',
        message: 'La vacante no existe.',
        requestId,
      });
    }

    if (!vacante.activa) {
      return apiErrorResponse({
        status: 400,
        code: 'VACANTE_INACTIVE',
        message: 'La vacante ya no está activa.',
        requestId,
      });
    }

    const existing = await dbClient.postulaciones.findUnique({
      where: {
        usuario_id_vacante_id: {
          usuario_id: usuario.usuario_id,
          vacante_id,
        },
      },
    });

    if (existing) {
      return apiErrorResponse({
        status: 409,
        code: 'ALREADY_APPLIED',
        message: 'Ya te postulaste a esta vacante.',
        requestId,
      });
    }

    const userSkills = await dbClient.usuarioHabilidades.findMany({
      where: { usuario_id: usuario.usuario_id },
      select: { habilidad_id: true },
    });

    const matchPorcentaje = calcularMatchPorcentaje(vacante.requisitos, userSkills);

    const result = await dbClient.postulaciones.create({
      data: {
        usuario_id: usuario.usuario_id,
        vacante_id,
        mensaje_motivacion: mensaje_motivacion ?? null,
        usar_cv_guardado,
        match_porcentaje: new Prisma.Decimal(matchPorcentaje),
        estado: 'Enviada',
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Postulación enviada con éxito',
      postulacionId: result.postulacion_id,
    });
  } catch (error) {
    logApiError({
      route: 'POST /api/postulaciones',
      requestId,
      error,
      context: { code: 'POSTULACION_CREATE_FAILED' },
    });

    return apiErrorResponse({
      status: 500,
      code: 'POSTULACION_CREATE_FAILED',
      message: 'No pudimos enviar tu postulación. Intentá de nuevo.',
      requestId,
    });
  }
}