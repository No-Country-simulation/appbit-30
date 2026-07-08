import { NextResponse } from 'next/server';
import { dbClient } from '@/src/server/clients/db.client';
import { getCurrentAuthUser } from '@/src/server/auth/get-current-auth-user';
import { findLinkedUsuario } from '@/src/server/auth/find-linked-usuario';
import {
  apiErrorResponse,
  getRequestId,
  logApiError,
} from '@/src/server/api/api-error';

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

function logSettledError({
  result,
  section,
  requestId,
  userId,
}: {
  result: PromiseSettledResult<unknown>;
  section: string;
  requestId: string;
  userId: string | null;
}) {
  if (result.status === 'rejected') {
    logApiError({
      route: 'GET /api/dashboard',
      requestId,
      error: result.reason,
      context: {
        section,
        userId,
        degraded: true,
      },
    });
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
  const requestId = getRequestId(request);
  let debugUserId: string | null = null;

  try {
    const authUser = await getCurrentAuthUser();

    if (!authUser) {
      return apiErrorResponse({
        status: 401,
        code: 'UNAUTHORIZED',
        message: 'Necesitás iniciar sesión para ver el dashboard.',
        requestId,
      });
    }

    const usuario = await findLinkedUsuario(authUser, dashboardUsuarioSelect);

    if (!usuario) {
      return apiErrorResponse({
        status: 404,
        code: 'USER_NOT_FOUND',
        message:
          'No encontramos tu perfil. Completá el onboarding para continuar.',
        requestId,
      });
    }

    const userId = usuario.usuario_id;
    debugUserId = userId;

    const url = new URL(request.url);
    const timezone = url.searchParams.get('timezone') ?? undefined;
    const { start: todayStart, end: todayEnd } = getUserDayRange(timezone);

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const orientacionPromise = dbClient.orientaciones.findFirst({
      where: { usuario_id: userId },
      orderBy: { creado_en: 'desc' },
      select: {
        gap_porcentual: true,
        vacantes_compatibles: true,
        gap_items: true,
        trayectoria_sugerida: true,
      },
    });

    const planAccionPromise = dbClient.planAccion.findMany({
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
    });

    const bienestarAggPromise = dbClient.checkIns.aggregate({
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
    });

    const todayCheckinPromise = dbClient.checkIns.findFirst({
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
    });

    const notificacionesNoLeidasPromise = dbClient.notificacionesRadar.count({
      where: {
        usuario_id: userId,
        leida: false,
      },
    });

    const perfilMovilidadPromise = dbClient.perfilMovilidad.findUnique({
      where: {
        usuario_id: userId,
      },
      select: {
        home_cluster: true,
        income_cluster: true,
        mobility_pattern: true,
      },
    });

    const userSkillsPromise = dbClient.usuarioHabilidades.findMany({
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
    });

    const [
      orientacionResult,
      planAccionResult,
      bienestarAggResult,
      todayCheckinResult,
      notificacionesNoLeidasResult,
      perfilMovilidadResult,
      userSkillsResult,
    ] = await Promise.allSettled([
      orientacionPromise,
      planAccionPromise,
      bienestarAggPromise,
      todayCheckinPromise,
      notificacionesNoLeidasPromise,
      perfilMovilidadPromise,
      userSkillsPromise,
    ] as const);

    const degradedSections: string[] = [];

    if (orientacionResult.status === 'rejected') {
      degradedSections.push('orientacion');
      logSettledError({
        result: orientacionResult,
        section: 'orientacion',
        requestId,
        userId,
      });
    }

    if (planAccionResult.status === 'rejected') {
      degradedSections.push('planAccion');
      logSettledError({
        result: planAccionResult,
        section: 'planAccion',
        requestId,
        userId,
      });
    }

    if (bienestarAggResult.status === 'rejected') {
      degradedSections.push('bienestarAgg');
      logSettledError({
        result: bienestarAggResult,
        section: 'bienestarAgg',
        requestId,
        userId,
      });
    }

    if (todayCheckinResult.status === 'rejected') {
      degradedSections.push('todayCheckin');
      logSettledError({
        result: todayCheckinResult,
        section: 'todayCheckin',
        requestId,
        userId,
      });
    }

    if (notificacionesNoLeidasResult.status === 'rejected') {
      degradedSections.push('notificacionesNoLeidas');
      logSettledError({
        result: notificacionesNoLeidasResult,
        section: 'notificacionesNoLeidas',
        requestId,
        userId,
      });
    }

    if (perfilMovilidadResult.status === 'rejected') {
      degradedSections.push('perfilMovilidad');
      logSettledError({
        result: perfilMovilidadResult,
        section: 'perfilMovilidad',
        requestId,
        userId,
      });
    }

    if (userSkillsResult.status === 'rejected') {
      degradedSections.push('userSkills');
      logSettledError({
        result: userSkillsResult,
        section: 'userSkills',
        requestId,
        userId,
      });
    }

    const orientacion =
      orientacionResult.status === 'fulfilled' ? orientacionResult.value : null;

    const planAccion =
      planAccionResult.status === 'fulfilled' ? planAccionResult.value : [];

    const bienestarAgg =
      bienestarAggResult.status === 'fulfilled'
        ? bienestarAggResult.value
        : {
            _avg: {
              nota_diaria: null,
            },
            _count: 0,
          };

    const todayCheckin =
      todayCheckinResult.status === 'fulfilled'
        ? todayCheckinResult.value
        : null;

    const notificacionesNoLeidas =
      notificacionesNoLeidasResult.status === 'fulfilled'
        ? notificacionesNoLeidasResult.value
        : 0;

    const perfilMovilidad =
      perfilMovilidadResult.status === 'fulfilled'
        ? perfilMovilidadResult.value
        : null;

    const userSkills =
      userSkillsResult.status === 'fulfilled' ? userSkillsResult.value : [];

    const areasInteres = Array.from(
      new Set(
        userSkills
          .map((skill) => skill.habilidad.area_principal)
          .filter((area): area is NonNullable<typeof area> => Boolean(area)),
      ),
    );

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
      success: true,
      requestId,
      degradedSections,
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
      areasInteres,
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
    logApiError({
      route: 'GET /api/dashboard',
      requestId,
      error,
      context: {
        code: 'DASHBOARD_LOAD_FAILED',
        userId: debugUserId,
      },
    });

    return apiErrorResponse({
      status: 500,
      code: 'DASHBOARD_LOAD_FAILED',
      message:
        'No pudimos cargar el dashboard. Intentá actualizar la página. Si vuelve a pasar, reportá el código de error.',
      requestId,
    });
  }
}
