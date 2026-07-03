import { NextResponse } from 'next/server';
import { dbClient } from '@/src/server/clients/db.client';
import { getCurrentAuthUser } from '@/src/server/auth/get-current-auth-user';
import { findLinkedUsuario } from '@/src/server/auth/find-linked-usuario';

export const dynamic = 'force-dynamic';

function clampPercent(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

const dashboardUsuarioSelect = {
  usuario_id: true,
  nombre_completo: true,
  avatar_url: true,
  confianza: true,
  home_cluster: true,
  whatsapp_codigo: true,
  whatsapp_numero: true,
  onboarding_status: true,
} as const;

export async function GET() {
  try {
    const authUser = await getCurrentAuthUser();

    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const usuario = await findLinkedUsuario(authUser, dashboardUsuarioSelect);

    if (!usuario) {
      return NextResponse.json(
        { error: 'User not found. Complete onboarding first.' },
        { status: 404 },
      );
    }

    const userId = usuario.usuario_id;

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const [
      orientacion,
      planAccion,
      bienestarAgg,
      notificacionesNoLeidas,
      perfilMovilidad,
      userSkills,
    ] = await Promise.all([
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
          curso: {
            select: {
              titulo: true,
            },
          },
        },
      }),

      dbClient.checkIns.aggregate({
        where: {
          usuario_id: userId,
          creado_en: {
            gte: sevenDaysAgo,
          },
        },
        _avg: {
          nota_diaria: true,
        },
        _count: true,
      }),

      dbClient.notificacionesRadar.count({
        where: {
          usuario_id: userId,
          leida: false,
        },
      }),

      dbClient.perfilMovilidad.findUnique({
        where: {
          usuario_id: userId,
        },
        select: {
          home_cluster: true,
          income_cluster: true,
          mobility_pattern: true,
        },
      }),

      dbClient.usuarioHabilidades.findMany({
        where: {
          usuario_id: userId,
        },
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
    ]);

    const onboardingCompleted = usuario.onboarding_status === 'COMPLETED';

    const ubicacionCompleted = Boolean(
      usuario.home_cluster || perfilMovilidad?.home_cluster,
    );

    const whatsappCompleted = Boolean(
      usuario.whatsapp_codigo && usuario.whatsapp_numero,
    );

    let perfilCompletado = 0;

    if (onboardingCompleted) perfilCompletado += 50;
    if (perfilMovilidad) perfilCompletado += 20;
    if (usuario.avatar_url) perfilCompletado += 10;
    if (ubicacionCompleted) perfilCompletado += 10;
    if (whatsappCompleted) perfilCompletado += 10;

    const totalUserSkills = userSkills.length;

    const faltantes = userSkills.filter(
      (skill) => skill.estado === 'Faltante',
    ).length;

    const computedGapPorcentual =
      totalUserSkills > 0
        ? clampPercent((faltantes / totalUserSkills) * 100)
        : null;

    const gapPorcentual = orientacion
      ? clampPercent(Number(orientacion.gap_porcentual))
      : computedGapPorcentual;

    const fallbackGapItems = userSkills
      .filter((skill) => skill.estado === 'Faltante')
      .map((skill) => ({
        habilidad_id: skill.habilidad.habilidad_id,
        nombre: skill.habilidad.nombre,
        categoria: skill.habilidad.categoria,
        area_principal: skill.habilidad.area_principal,
        estado: skill.estado,
      }));

    const matchPerfil =
      gapPorcentual != null
        ? clampPercent(100 - gapPorcentual)
        : clampPercent(Number(usuario.confianza ?? 0));

    return NextResponse.json({
      perfil_completado: perfilCompletado,
      match_perfil: matchPerfil,
      perfil_breakdown: {
        onboarding: onboardingCompleted,
        movilidad: !!perfilMovilidad,
        avatar: !!usuario.avatar_url,
        ubicacion: ubicacionCompleted,
        whatsapp: whatsappCompleted,
      },
      usuario: {
        nombre_completo: usuario.nombre_completo,
        avatar_url: usuario.avatar_url,
        confianza: usuario.confianza != null ? Number(usuario.confianza) : null,
        home_cluster: usuario.home_cluster,
      },
      orientacion:
        gapPorcentual != null
          ? {
              gap_porcentual: gapPorcentual,
              vacantes_compatibles: orientacion
                ? (orientacion.vacantes_compatibles as unknown[])
                : [],
              gap_items: orientacion
                ? (orientacion.gap_items as unknown[])
                : fallbackGapItems,
              trayectoria_sugerida: orientacion
                ? (orientacion.trayectoria_sugerida as unknown[])
                : [],
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
    });
  } catch (error) {
    console.error('Error fetching dashboard data:', error);

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
