import { NextResponse } from 'next/server';
import { dbClient } from '@/src/server/clients/db.client';
import { getCurrentAuthUser } from '@/src/server/auth/get-current-auth-user';
import { findLinkedUsuario } from '@/src/server/auth/find-linked-usuario';
import { AreaInteresEnum, ModalidadVacanteEnum } from '@/src/server/generated/prisma';
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
import { calcularMatchConAI } from '@/src/lib/job-match-helper';

export const dynamic = 'force-dynamic';

function formatDate(date: Date): string {
  return date.toLocaleDateString('es-AR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export async function GET(request: Request) {
  const requestId = getRequestId(request);

  try {
    const authUser = await getCurrentAuthUser();

    if (!authUser) {
      return apiErrorResponse({
        status: 401,
        code: 'UNAUTHORIZED',
        message: 'Necesitás iniciar sesión para ver las vacantes.',
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

    const { searchParams } = new URL(request.url);
    const areaFilter = searchParams.get('area') as AreaInteresEnum | null;
    const modalidadFilter = searchParams.get('modalidad') as ModalidadVacanteEnum | null;
    const searchQuery = searchParams.get('search');

    const where: Record<string, unknown> = { activa: true };

    if (areaFilter) {
      where.area = areaFilter;
    }

    if (modalidadFilter) {
      where.modalidad = modalidadFilter;
    }

    if (searchQuery) {
      where.titulo = { contains: searchQuery, mode: 'insensitive' };
    }

    const [vacantes, userSkills] = await Promise.all([
      dbClient.vacantes.findMany({
        where: where as any,
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
        orderBy: { fecha_publicacion: 'desc' },
      }),
      dbClient.usuarioHabilidades.findMany({
        where: { usuario_id: userId },
        select: { habilidad_id: true },
      }),
    ]);

    const formatted = await Promise.all(vacantes.map(async (v) => {
      const matchPorcentaje = await calcularMatchConAI(
        v.requisitos,
        userSkills,
        userId,
        v.vacante_id,
        v.titulo,
        v.educacion_requerida,
        v.idiomas_requeridos as string[] | undefined,
        v.distancia_zona,
      );

      const sectorSize = [v.empresa.sector, v.empresa.tamanio]
        .filter(Boolean)
        .join(' · ');

      const empresaDescripcion = [sectorSize, v.ciudad].filter(Boolean).join(' · ');

      const ubicacion = [v.ciudad, v.pais].filter(Boolean).join(', ');

      const educacionRequerida = v.educacion_requerida
        ? v.educacion_requerida.split(',').map((s) => s.trim())
        : [];

      const experienciaSolicitada = v.experiencia_solicitada
        ? v.experiencia_solicitada.split(',').map((s) => s.trim())
        : [];

      const idiomas = Array.isArray(v.idiomas_requeridos)
        ? (v.idiomas_requeridos as string[])
        : [];

      const jornada = v.jornada
        ? [getLabel(jornadaLabels, v.jornada, v.jornada)]
        : [];

      return {
        id: v.vacante_id,
        titulo: v.titulo,
        empresa: v.empresa.nombre,
        empresaDescripcion: empresaDescripcion || null,
        logoUrl: v.empresa.logo_url,
        area: getLabel(areaLabels, v.area, v.area),
        nivel: getLabel(nivelLabels, v.nivel, v.nivel),
        modalidad: getLabel(modalidadLabels, v.modalidad, v.modalidad),
        modalidadDetallada: v.detalle_modalidad ?? null,
        ubicacion,
        distancia: v.distancia_zona ?? null,
        matchPorcentaje,
        fechaPublicacion: formatDate(v.fecha_publicacion),
        descripcion: v.descripcion,
        educacionRequerida,
        experienciaSolicitada,
        idioma: idiomas,
        jornada,
        skills: v.requisitos.map((r) => ({
          nombre: r.habilidad.nombre,
          laTienes: userSkills.some((us) => us.habilidad_id === r.habilidad.habilidad_id),
        })),
      };
    }));

    return NextResponse.json({ vacantes: formatted });
  } catch (error) {
    logApiError({
      route: 'GET /api/vacantes',
      requestId,
      error,
      context: { code: 'VACANTES_FETCH_FAILED' },
    });

    return apiErrorResponse({
      status: 500,
      code: 'VACANTES_FETCH_FAILED',
      message: 'No pudimos cargar las vacantes. Intentá de nuevo.',
      requestId,
    });
  }
}