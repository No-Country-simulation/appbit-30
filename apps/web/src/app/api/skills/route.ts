import { NextResponse } from 'next/server';
import { dbClient } from '@/src/server/clients/db.client';
import { getCurrentAuthUser } from '@/src/server/auth/get-current-auth-user';
import { AreaInteresEnum } from '../../../../src/server/generated/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const authUser = await getCurrentAuthUser();

    if (!authUser) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 },
      );
    }

    const usuario = await dbClient.usuarios.findUnique({
      where: { auth_uid: authUser.id },
      select: { usuario_id: true },
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

    const response = {
      habilidades: userSkills.map((us) => ({
        habilidad_id: us.habilidad.habilidad_id,
        nombre: us.habilidad.nombre,
        categoria: us.habilidad.categoria,
        area_principal: us.habilidad.area_principal,
        estado:
          us.estado === 'En_progreso' ? 'En progreso' : us.estado,
      })),
      gaps: orientacion?.gap_items ?? [],
      mercadoHabilidades,
      resumen: {
        adquiridas: userSkills.filter((s) => s.estado === 'Adquirida').length,
        faltantes: userSkills.filter((s) => s.estado === 'Faltante').length,
        enProgreso: userSkills.filter((s) => s.estado === 'En_progreso').length,
        totalMercado: mercadoHabilidades.length,
      },
      orientacion: orientacion
        ? {
            gap_porcentual: Number(orientacion.gap_porcentual),
            trayectoria_sugerida:
              orientacion.trayectoria_sugerida as unknown[],
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
