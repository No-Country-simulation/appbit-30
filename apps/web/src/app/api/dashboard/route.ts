import { NextResponse } from 'next/server';
import { dbClient } from '@/src/server/clients/db.client';
import { getCurrentAuthUser } from '@/src/server/auth/get-current-auth-user';
import { findLinkedUsuario } from '@/src/server/auth/find-linked-usuario';

export const dynamic = 'force-dynamic';

function clampPercent(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function getTimeZoneOffsetMs(date: Date, timeZone: string) {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone,
    timeZoneName: 'shortOffset',
  });

  const timeZoneName = formatter
    .formatToParts(date)
    .find((part) => part.type === 'timeZoneName')?.value;

  if (!timeZoneName || timeZoneName === 'GMT') {
    return 0;
  }

  const match = timeZoneName.match(/^GMT([+-])(\d{1,2})(?::(\d{2}))?$/);

  if (!match) {
    return 0;
  }

  const sign = match[1] === '-' ? -1 : 1;
  const hours = Number(match[2] ?? 0);
  const minutes = Number(match[3] ?? 0);

  return sign * ((hours * 60 + minutes) * 60 * 1000);
}

function getUserDayRange(timeZone?: string) {
  const safeTimeZone = timeZone || 'UTC';

  try {
    new Intl.DateTimeFormat('en-US', {
      timeZone: safeTimeZone,
    }).format();

    const now = new Date();

    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone: safeTimeZone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).formatToParts(now);

    const values = Object.fromEntries(
      parts
        .filter((part) => part.type !== 'literal')
        .map((part) => [part.type, part.value]),
    );

    const year = Number(values.year);
    const month = Number(values.month);
    const day = Number(values.day);

    const startLocalAsUtc = new Date(Date.UTC(year, month - 1, day));
    const endLocalAsUtc = new Date(Date.UTC(year, month - 1, day + 1));

    const startOffset = getTimeZoneOffsetMs(startLocalAsUtc, safeTimeZone);
    const endOffset = getTimeZoneOffsetMs(endLocalAsUtc, safeTimeZone);

    return {
      start: new Date(startLocalAsUtc.getTime() - startOffset),
      end: new Date(endLocalAsUtc.getTime() - endOffset),
    };
  } catch {
    const now = new Date();

    const start = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
    );

    const end = new Date(start);
    end.setUTCDate(end.getUTCDate() + 1);

    return { start, end };
  }
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

export async function GET(request: Request) {
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

    const url = new URL(request.url);
    const timezone = url.searchParams.get('timezone') ?? undefined;
    const { start: todayStart, end: todayEnd } = getUserDayRange(timezone);

    const userId = usuario.usuario_id;

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const [
      orientacion,
      planAccion,
      bienestarAgg,
      todayCheckin,
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

      dbClient.checkIns.findFirst({
        where: {
          usuario_id: userId,
          creado_en: {
            gte: todayStart,
            lt: todayEnd,
          },
        },
        orderBy: {
          creado_en: 'desc',
        },
        select: {
          checkin_id: true,
          emoji: true,
          nota_diaria: true,
          creado_en: true,
        },
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
        hasCheckinToday: Boolean(todayCheckin),
        todayCheckin: todayCheckin
          ? {
              checkin_id: todayCheckin.checkin_id,
              emoji: todayCheckin.emoji.toLowerCase(),
              nota_diaria: Number(todayCheckin.nota_diaria),
              creado_en: todayCheckin.creado_en.toISOString(),
            }
          : null,
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
