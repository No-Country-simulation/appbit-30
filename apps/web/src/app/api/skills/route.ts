import { NextResponse } from 'next/server';
import { dbClient } from '@/src/server/clients/db.client';
import { getCurrentAuthUser } from '@/src/server/auth/get-current-auth-user';
import { findLinkedUsuario } from '@/src/server/auth/find-linked-usuario';
import { AreaInteresEnum } from '@/src/server/generated/prisma';
import { calculateSkillsMatch } from '@/src/server/progress/skill-progress';

export const dynamic = 'force-dynamic';

function clampPercent(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
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

    const [userSkills, orientacion, mercadoHabilidades] = await Promise.all([
      dbClient.usuarioHabilidades.findMany({
        where: { usuario_id: userId },
        include: {
          habilidad: {
            select: {
              habilidad_id: true,
              nombre: true,
              categoria: true,
              area_principal: true,
            },
          },
        },
        orderBy: {
          habilidad: {
            nombre: 'asc',
          },
        },
      }),

      dbClient.orientaciones.findFirst({
        where: { usuario_id: userId },
        orderBy: { creado_en: 'desc' },
        select: {
          gap_porcentual: true,
          gap_items: true,
          trayectoria_sugerida: true,
        },
      }),

      dbClient.habilidadesMercado.findMany({
        where: areaFilter ? { area_principal: areaFilter } : undefined,
        orderBy: { nombre: 'asc' },
        select: {
          habilidad_id: true,
          nombre: true,
          categoria: true,
          area_principal: true,
        },
      }),
    ]);

    const adquiridas = userSkills.filter(
      (skill) => skill.estado === 'Adquirida',
    ).length;

    const faltantes = userSkills.filter(
      (skill) => skill.estado === 'Faltante',
    ).length;

    const enProgreso = userSkills.filter(
      (skill) => skill.estado === 'En_progreso',
    ).length;

    const totalUserSkills = userSkills.length;

    const currentMatch =
      totalUserSkills > 0 ? calculateSkillsMatch(userSkills) : null;
    const computedGapPorcentual =
      currentMatch === null ? null : clampPercent(100 - currentMatch);

    const fallbackGaps = userSkills
      .filter((skill) => skill.estado === 'Faltante')
      .map((skill) => ({
        habilidad_id: skill.habilidad.habilidad_id,
        nombre: skill.habilidad.nombre,
        categoria: skill.habilidad.categoria,
        area_principal: skill.habilidad.area_principal,
        estado: skill.estado,
      }));

    const response = {
      habilidades: userSkills.map((us) => ({
        habilidad_id: us.habilidad.habilidad_id,
        nombre: us.habilidad.nombre,
        categoria: us.habilidad.categoria,
        area_principal: us.habilidad.area_principal,
        estado: us.estado === 'En_progreso' ? 'En progreso' : us.estado,
        progreso_porcentaje: us.progreso_porcentaje,
      })),
      gaps: orientacion?.gap_items ?? fallbackGaps,
      mercadoHabilidades,
      resumen: {
        adquiridas,
        faltantes,
        enProgreso,
        totalMercado: mercadoHabilidades.length,
        matchActual: currentMatch,
      },
      orientacion: orientacion
        ? {
            gap_porcentual: clampPercent(Number(orientacion.gap_porcentual)),
            trayectoria_sugerida: orientacion.trayectoria_sugerida as unknown[],
          }
        : computedGapPorcentual != null
          ? {
              gap_porcentual: computedGapPorcentual,
              trayectoria_sugerida: [],
            }
          : null,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching skills data:', error);

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
