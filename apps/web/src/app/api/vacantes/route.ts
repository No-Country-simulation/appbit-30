import { NextResponse } from 'next/server';
import { dbClient } from '@/src/server/clients/db.client';
import { getCurrentAuthUser } from '@/src/server/auth/get-current-auth-user';
import { findLinkedUsuario } from '@/src/server/auth/find-linked-usuario';
import { AreaInteresEnum, ModalidadVacanteEnum } from '@/src/server/generated/prisma';

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

export async function GET(request: Request) {
  try {
    const authUser = await getCurrentAuthUser();

    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const usuario = await findLinkedUsuario(authUser, {
      usuario_id: true,
    });

    if (!usuario) {
      return NextResponse.json(
        { error: 'User not found. Complete onboarding first.' },
        { status: 404 },
      );
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

    const formatted = vacantes.map((v) => {
      const matchPorcentaje = calcularMatchPorcentaje(v.requisitos, userSkills);

      const sectorSize = [v.empresa.sector, v.empresa.tamanio]
        .filter(Boolean)
        .join(' · ');

      const empresaDescripcion = [sectorSize, v.ciudad].filter(Boolean).join(' · ');

      const ubicacion = [v.ciudad, v.pais].filter(Boolean).join(', ');

      const modalidadLabels: Record<string, string> = {
        Presencial: 'Presencial',
        Hibrido: 'Híbrido',
        Remoto: '100% Remoto',
      };

      const jornadaLabels: Record<string, string> = {
        Jornada_completa: 'Jornada completa',
        Media_jornada: 'Media jornada',
        Relacion_dependencia: 'Relación de dependencia',
        Freelance: 'Freelance',
      };

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
        ? [jornadaLabels[v.jornada] ?? v.jornada]
        : [];

      return {
        id: v.vacante_id,
        titulo: v.titulo,
        empresa: v.empresa.nombre,
        empresaDescripcion: empresaDescripcion || null,
        logoUrl: v.empresa.logo_url,
        area: v.area,
        nivel: v.nivel,
        modalidad: modalidadLabels[v.modalidad] ?? v.modalidad,
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
    });

    return NextResponse.json({ vacantes: formatted });
  } catch (error) {
    console.error('Error fetching vacantes:', error);

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
