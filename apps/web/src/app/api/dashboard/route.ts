import { NextResponse } from 'next/server';
import { dbClient } from '@/src/server/clients/db.client';
import { getCurrentAuthUser } from '@/src/server/auth/get-current-auth-user';

const DEV_USER_ID = '003f7b4f-364b-4fa0-b921-2452393769d6';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const authUser = await getCurrentAuthUser();

    let usuario: { usuario_id: string; nombre_completo: string; avatar_url: string | null; confianza: number | null; home_cluster: string | null } | null = null;

    if (authUser) {
      usuario = await dbClient.usuarios.findUnique({
        where: { auth_uid: authUser.id },
        select: {
          usuario_id: true,
          nombre_completo: true,
          avatar_url: true,
          confianza: true,
          home_cluster: true,
        },
      });
    }

    // Modo dev: usar usuario de prueba si no hay auth
    if (!usuario) {
      usuario = await dbClient.usuarios.findUnique({
        where: { usuario_id: DEV_USER_ID },
        select: {
          usuario_id: true,
          nombre_completo: true,
          avatar_url: true,
          confianza: true,
          home_cluster: true,
        },
      });
    }

    if (!usuario) {
      return NextResponse.json(
        { error: 'User not found. Complete onboarding first.' },
        { status: 404 },
      );
    }

    const userId = usuario.usuario_id;

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const [orientacion, planAccion, bienestarAgg, notificacionesNoLeidas, perfilMovilidad] =
      await Promise.all([
        dbClient.orientaciones.findFirst({
          where: { usuario_id: userId },
          orderBy: { creado_en: 'desc' },
          select: {
            gap_porcentual: true,
            vacantes_compatibles: true,
            gap_items: true,
            trayectoria_sugerida: true,
          },
        }),
        dbClient.planAccion.findMany({
          where: { usuario_id: userId },
          orderBy: { orden: 'asc' },
          select: {
            plan_item_id: true,
            titulo: true,
            prioridad: true,
            completado: true,
            orden: true,
            accion_label: true,
            curso: { select: { titulo: true } },
          },
        }),
        dbClient.checkIns.aggregate({
          where: {
            usuario_id: userId,
            creado_en: { gte: sevenDaysAgo },
          },
          _avg: { nota_diaria: true },
          _count: true,
        }),
        dbClient.notificacionesRadar.count({
          where: { usuario_id: userId, leida: false },
        }),
        dbClient.perfilMovilidad.findUnique({
          where: { usuario_id: userId },
          select: {
            home_cluster: true,
            income_cluster: true,
            mobility_pattern: true,
          },
        }),
      ]);

    const response = {
      usuario: {
        nombre_completo: usuario.nombre_completo,
        avatar_url: usuario.avatar_url,
        confianza: usuario.confianza != null ? Number(usuario.confianza) : null,
        home_cluster: usuario.home_cluster,
      },
      orientacion: orientacion
        ? {
            gap_porcentual: Number(orientacion.gap_porcentual),
            vacantes_compatibles: orientacion.vacantes_compatibles as unknown[],
            gap_items: orientacion.gap_items as unknown[],
            trayectoria_sugerida: orientacion.trayectoria_sugerida as unknown[],
          }
        : null,
      planAccion: planAccion.map((item) => ({
        plan_item_id: item.plan_item_id,
        titulo: item.titulo,
        prioridad: item.prioridad,
        completado: item.completado,
        orden: item.orden,
        accion_label: item.accion_label,
        curso: item.curso,
      })),
      bienestar: {
        notaPromedio:
          bienestarAgg._avg.nota_diaria != null
            ? Number(bienestarAgg._avg.nota_diaria)
            : 0,
        totalCheckins: bienestarAgg._count,
      },
      notificacionesNoLeidas,
      perfilMovilidad,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
