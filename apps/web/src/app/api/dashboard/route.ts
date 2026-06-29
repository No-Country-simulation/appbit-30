import { NextResponse } from 'next/server';
import { dbClient } from '../../../server/clients/db.client';
import { getCurrentAuthUser } from '@/src/server/auth/get-current-auth-user';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const authUser = await getCurrentAuthUser();
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const email = authUser.email;
    if (!email) {
      return NextResponse.json({ error: 'Email not found' }, { status: 400 });
    }

    const usuario = await dbClient.usuarios.findUnique({
      where: { email },
      select: {
        usuario_id: true,
        nombre_completo: true,
        avatar_url: true,
        confianza: true,
        home_cluster: true,
        perfil_movilidad: {
          select: {
            home_cluster: true,
            income_cluster: true,
            mobility_pattern: true,
          },
        },
      },
    });

    if (!usuario) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const orientacion = await dbClient.orientaciones.findFirst({
      where: { usuario_id: usuario.usuario_id },
      orderBy: { creado_en: 'desc' },
      select: {
        gap_porcentual: true,
        gap_items: true,
        vacantes_compatibles: true,
        trayectoria_sugerida: true,
      },
    });

    const planAccion = await dbClient.planAccion.findMany({
      where: { usuario_id: usuario.usuario_id },
      orderBy: [{ orden: 'asc' }, { prioridad: 'asc' }],
      select: {
        plan_item_id: true,
        titulo: true,
        prioridad: true,
        accion_label: true,
        completado: true,
        orden: true,
        curso: {
          select: { titulo: true },
        },
      },
    });

    const sieteDiasAtras = new Date();
    sieteDiasAtras.setDate(sieteDiasAtras.getDate() - 7);

    const checkinsRecientes = await dbClient.checkIns.findMany({
      where: {
        usuario_id: usuario.usuario_id,
        creado_en: { gte: sieteDiasAtras },
      },
      select: { nota_diaria: true },
    });

    let notaPromedio = null;
    if (checkinsRecientes.length > 0) {
      const suma = checkinsRecientes.reduce(
        (acc, c) => acc + Number(c.nota_diaria),
        0,
      );
      notaPromedio = Number((suma / checkinsRecientes.length).toFixed(2));
    }

    const notificacionesNoLeidas = await dbClient.notificacionesRadar.count({
      where: {
        usuario_id: usuario.usuario_id,
        leida: false,
      },
    });

    return NextResponse.json({
      usuario: {
        nombre_completo: usuario.nombre_completo,
        avatar_url: usuario.avatar_url,
        confianza: usuario.confianza ? Number(usuario.confianza) : null,
        home_cluster: usuario.home_cluster,
      },
      perfilMovilidad: usuario.perfil_movilidad,
      orientacion: orientacion
        ? {
            gap_porcentual: Number(orientacion.gap_porcentual),
            totalVacantes: Array.isArray(orientacion.vacantes_compatibles)
              ? orientacion.vacantes_compatibles.length
              : 0,
            gap_items: orientacion.gap_items,
            trayectoria_sugerida: orientacion.trayectoria_sugerida,
          }
        : null,
      planAccion: planAccion.map((item) => ({
        plan_item_id: item.plan_item_id,
        titulo: item.titulo,
        prioridad: item.prioridad,
        accion_label: item.accion_label,
        completado: item.completado,
        orden: item.orden,
        curso: item.curso,
      })),
      bienestar: {
        notaPromedio,
        totalCheckins: checkinsRecientes.length,
      },
      notificacionesNoLeidas,
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 },
    );
  }
}
