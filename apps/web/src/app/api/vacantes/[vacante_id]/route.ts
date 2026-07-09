import { NextResponse } from 'next/server';
import { dbClient } from '@/src/server/clients/db.client';
import { getCurrentAuthUser } from '@/src/server/auth/get-current-auth-user';
import { findLinkedUsuario } from '@/src/server/auth/find-linked-usuario';
import {
  apiErrorResponse,
  getRequestId,
  logApiError,
} from '@/src/server/api/api-error';
import {
  areaLabels,
  nivelLabels,
  modalidadLabels,
  jornadaLabels,
  getLabel,
} from '@/src/lib/label-helpers';

export const dynamic = 'force-dynamic';

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

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ vacante_id: string }> },
) {
  const requestId = getRequestId(_request);

  try {
    const { vacante_id } = await params;

    const authUser = await getCurrentAuthUser();

    if (!authUser) {
      return apiErrorResponse({
        status: 401,
        code: 'UNAUTHORIZED',
        message: 'Necesitás iniciar sesión para ver el detalle de la vacante.',
        requestId,
      });
    }

    const usuario = await findLinkedUsuario(authUser, {
      usuario_id: true,
    });

    if (!usuario) {
      return apiErrorResponse({
        status: 404,
        code: 'USER_NOT_FOUND',
        message: 'No encontramos tu perfil. Completá el onboarding para continuar.',
        requestId,
      });
    }

    const userId = usuario.usuario_id;

    const [vacante, userSkills] = await Promise.all([
      dbClient.vacantes.findUnique({
        where: { vacante_id },
        include: {
          empresa: {
            select: {
              nombre: true,
              logo_url: true,
              descripcion: true,
              sector: true,
              tamanio: true,
            },
          },
          requisitos: {
            include: {
              habilidad: {
                select: {
                  habilidad_id: true,
                  nombre: true,
                },
              },
            },
          },
        },
      }),
      dbClient.usuarioHabilidades.findMany({
        where: { usuario_id: userId },
        select: { habilidad_id: true },
      }),
    ]);

    if (!vacante) {
      return apiErrorResponse({
        status: 404,
        code: 'VACANTE_NOT_FOUND',
        message: 'La vacante no existe.',
        requestId,
      });
    }

    const matchPorcentaje = calcularMatchPorcentaje(vacante.requisitos, userSkills);

    const sectorSize = [vacante.empresa.sector, vacante.empresa.tamanio]
      .filter(Boolean)
      .join(' · ');

    const empresaDescripcion = [sectorSize, vacante.ciudad].filter(Boolean).join(' · ');

    const ubicacion = [vacante.ciudad, vacante.pais].filter(Boolean).join(', ');

    const educacionRequerida = vacante.educacion_requerida
      ? vacante.educacion_requerida.split(',').map((s) => s.trim())
      : [];

    const experienciaSolicitada = vacante.experiencia_solicitada
      ? vacante.experiencia_solicitada.split(',').map((s) => s.trim())
      : [];

    const idiomas = Array.isArray(vacante.idiomas_requeridos)
      ? (vacante.idiomas_requeridos as string[])
      : [];

    const jornada = vacante.jornada
      ? [getLabel(jornadaLabels, vacante.jornada, vacante.jornada)]
      : [];

    const formatted = {
      id: vacante.vacante_id,
      titulo: vacante.titulo,
      empresa: vacante.empresa.nombre,
      empresaDescripcion: empresaDescripcion || null,
      logoUrl: vacante.empresa.logo_url,
      area: getLabel(areaLabels, vacante.area, vacante.area),
      nivel: getLabel(nivelLabels, vacante.nivel, vacante.nivel),
      modalidad: getLabel(modalidadLabels, vacante.modalidad, vacante.modalidad),
      modalidadDetallada: vacante.detalle_modalidad ?? null,
      ubicacion,
      distancia: vacante.distancia_zona ?? null,
      matchPorcentaje,
      fechaPublicacion: formatDate(vacante.fecha_publicacion),
      descripcion: vacante.descripcion,
      educacionRequerida,
      experienciaSolicitada,
      idioma: idiomas,
      jornada,
      skills: vacante.requisitos.map((r) => ({
        nombre: r.habilidad.nombre,
        laTienes: userSkills.some((us) => us.habilidad_id === r.habilidad.habilidad_id),
      })),
    };

    return NextResponse.json(formatted);
  } catch (error) {
    logApiError({
      route: 'GET /api/vacantes/[vacante_id]',
      requestId,
      error,
      context: { code: 'VACANTE_DETAIL_FETCH_FAILED' },
    });

    return apiErrorResponse({
      status: 500,
      code: 'VACANTE_DETAIL_FETCH_FAILED',
      message: 'No pudimos cargar el detalle de la vacante. Intentá de nuevo.',
      requestId,
    });
  }
}