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

type AiRecommendationsStatus = 'generating' | 'ready' | 'fallback';

const DASHBOARD_API_PERF_LOGS_ENABLED =
  process.env.NODE_ENV !== 'production' ||
  process.env.DASHBOARD_PERF_LOGS === 'true';

function clampPercent(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function getServerNowMs() {
  return Date.now();
}

function getErrorSummary(error: unknown) {
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
    };
  }

  return {
    name: 'UnknownError',
    message: String(error),
  };
}

function logDashboardApiPerf(
  event: string,
  context: Record<string, unknown> = {},
) {
  if (!DASHBOARD_API_PERF_LOGS_ENABLED) {
    return;
  }

  console.info(
    JSON.stringify({
      level: 'info',
      scope: 'dashboard-api-perf',
      route: 'GET /api/dashboard',
      event,
      ...context,
    }),
  );
}

function createDashboardApiTimer(requestId: string) {
  const requestStartedAt = getServerNowMs();

  function mark(event: string, context: Record<string, unknown> = {}) {
    logDashboardApiPerf(event, {
      requestId,
      elapsedMs: getServerNowMs() - requestStartedAt,
      ...context,
    });
  }

  async function measure<T>(
    section: string,
    run: () => Promise<T>,
  ): Promise<T> {
    const sectionStartedAt = getServerNowMs();

    mark('section_start', { section });

    try {
      const value = await run();

      mark('section_done', {
        section,
        durationMs: getServerNowMs() - sectionStartedAt,
      });

      return value;
    } catch (error) {
      mark('section_error', {
        section,
        durationMs: getServerNowMs() - sectionStartedAt,
        error: getErrorSummary(error),
      });

      throw error;
    }
  }

  return {
    mark,
    measure,
  };
}

function trackDashboardPromise<T>(
  timer: ReturnType<typeof createDashboardApiTimer>,
  section: string,
  promise: PromiseLike<T>,
): Promise<T> {
  const sectionStartedAt = getServerNowMs();

  timer.mark('db_section_start', { section });

  return Promise.resolve(promise).then(
    (value) => {
      timer.mark('db_section_done', {
        section,
        durationMs: getServerNowMs() - sectionStartedAt,
      });

      return value;
    },
    (error) => {
      timer.mark('db_section_error', {
        section,
        durationMs: getServerNowMs() - sectionStartedAt,
        error: getErrorSummary(error),
      });

      throw error;
    },
  );
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

    return {
      start,
      end,
    };
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

function getUniqueNonEmptyValues(values: Array<string | null | undefined>) {
  return Array.from(
    new Set(values.filter((value): value is string => Boolean(value))),
  );
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
  const timer = createDashboardApiTimer(requestId);
  let debugUserId: string | null = null;

  timer.mark('request_start');

  try {
    const authUser = await timer.measure('auth_user', () =>
      getCurrentAuthUser(),
    );

    if (!authUser) {
      return apiErrorResponse({
        status: 401,
        code: 'UNAUTHORIZED',
        message: 'Necesitás iniciar sesión para ver el dashboard.',
        requestId,
      });
    }

    const usuario = await timer.measure('find_linked_usuario', () =>
      findLinkedUsuario(authUser, dashboardUsuarioSelect),
    );

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

    timer.mark('usuario_resolved', {
      userId,
      onboardingStatus: usuario.onboarding_status,
    });

    const url = new URL(request.url);
    const timezone = url.searchParams.get('timezone') ?? undefined;
    const { start: todayStart, end: todayEnd } = getUserDayRange(timezone);

    timer.mark('timezone_resolved', {
      timezone: timezone ?? null,
      todayStart: todayStart.toISOString(),
      todayEnd: todayEnd.toISOString(),
    });

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const orientacionPromise = dbClient.orientaciones.findFirst({
      where: {
        usuario_id: userId,
      },
      orderBy: {
        creado_en: 'desc',
      },
      select: {
        gap_porcentual: true,
        vacantes_compatibles: true,
        gap_items: true,
        trayectoria_sugerida: true,
        confianza: true,
      },
    });

    const planAccionPromise = dbClient.planAccion.findMany({
      where: {
        usuario_id: userId,
      },
      orderBy: {
        orden: 'asc',
      },
      take: 6,
      select: {
        plan_item_id: true,
        titulo: true,
        prioridad: true,
        completado: true,
        orden: true,
        accion_label: true,
        curso_vinculado_id: true,
      },
    });

    const recentCheckinsPromise = dbClient.checkIns.findMany({
      where: {
        usuario_id: userId,
        creado_en: {
          gte: sevenDaysAgo,
        },
      },
      orderBy: {
        creado_en: 'desc',
      },
      take: 30,
      select: {
        checkin_id: true,
        emoji: true,
        nota_diaria: true,
        creado_en: true,
      },
    });

    const areasInteresPromise = dbClient.usuarioAreasInteres.findMany({
      where: {
        usuario_id: userId,
      },
      select: {
        area: true,
      },
    });

    const userSkillsPromise = dbClient.usuarioHabilidades.findMany({
      where: {
        usuario_id: userId,
      },
      select: {
        estado: true,
      },
    });

    const dbStartedAt = getServerNowMs();

    const [
      orientacionResult,
      planAccionResult,
      recentCheckinsResult,
      areasInteresResult,
      userSkillsResult,
    ] = await Promise.allSettled([
      trackDashboardPromise(timer, 'orientacion', orientacionPromise),
      trackDashboardPromise(timer, 'planAccion', planAccionPromise),
      trackDashboardPromise(timer, 'recentCheckins', recentCheckinsPromise),
      trackDashboardPromise(timer, 'areasInteres', areasInteresPromise),
      trackDashboardPromise(timer, 'userSkills', userSkillsPromise),
    ] as const);

    timer.mark('db_all_settled_done', {
      durationMs: getServerNowMs() - dbStartedAt,
    });

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

    if (recentCheckinsResult.status === 'rejected') {
      degradedSections.push('recentCheckins');
      logSettledError({
        result: recentCheckinsResult,
        section: 'recentCheckins',
        requestId,
        userId,
      });
    }

    if (areasInteresResult.status === 'rejected') {
      degradedSections.push('areasInteres');
      logSettledError({
        result: areasInteresResult,
        section: 'areasInteres',
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

    const recentCheckins =
      recentCheckinsResult.status === 'fulfilled'
        ? recentCheckinsResult.value
        : [];

    const areasInteres =
      areasInteresResult.status === 'fulfilled'
        ? areasInteresResult.value.map((item) => item.area)
        : [];

    const userSkills =
      userSkillsResult.status === 'fulfilled' ? userSkillsResult.value : [];

    const todayCheckin =
      recentCheckins.find(
        (checkin) =>
          checkin.creado_en >= todayStart && checkin.creado_en < todayEnd,
      ) ?? null;

    const notaPromedio =
      recentCheckins.length > 0
        ? recentCheckins.reduce(
            (sum, checkin) => sum + Number(checkin.nota_diaria),
            0,
          ) / recentCheckins.length
        : 0;

    const orientacionConfianza =
      orientacion?.confianza != null ? Number(orientacion.confianza) : null;

    const aiRecommendationsStatus: AiRecommendationsStatus = !orientacion
      ? 'generating'
      : orientacionConfianza != null && orientacionConfianza >= 0.8
        ? 'ready'
        : 'fallback';

    const shouldExposePlanAccion = aiRecommendationsStatus !== 'generating';

    const linkedCursoIds = shouldExposePlanAccion
      ? getUniqueNonEmptyValues(
          planAccion.map((item) => item.curso_vinculado_id),
        )
      : [];

    const linkedCursosById = new Map<
      string,
      {
        curso_id: string;
        titulo: string;
        url_externa: string | null;
        plataforma: string | null;
        tipo: string;
        hasInternalContent: boolean;
      }
    >();

    if (linkedCursoIds.length > 0) {
      try {
        const linkedCursos = await timer.measure('linked_cursos', () =>
          dbClient.cursos.findMany({
            where: {
              curso_id: {
                in: linkedCursoIds,
              },
            },
            select: {
              curso_id: true,
              titulo: true,
              url_externa: true,
              plataforma: true,
              tipo: true,
              modulos: {
                where: {
                  lecciones: {
                    some: {
                      video_url: {
                        not: null,
                      },
                    },
                  },
                },
                take: 1,
                select: {
                  modulo_id: true,
                },
              },
            },
          }),
        );

        for (const curso of linkedCursos) {
          linkedCursosById.set(curso.curso_id, {
            curso_id: curso.curso_id,
            titulo: curso.titulo,
            url_externa: curso.url_externa,
            plataforma: curso.plataforma,
            tipo: String(curso.tipo),
            hasInternalContent: curso.modulos.length > 0,
          });
        }

        timer.mark('linked_cursos_ready', {
          requestedCursoIds: linkedCursoIds.length,
          loadedCursos: linkedCursos.length,
        });
      } catch (error) {
        degradedSections.push('linkedCursos');

        logApiError({
          route: 'GET /api/dashboard',
          requestId,
          error,
          context: {
            section: 'linkedCursos',
            userId,
            degraded: true,
            linkedCursoIds,
          },
        });

        timer.mark('linked_cursos_error', {
          linkedCursoIds,
          error: getErrorSummary(error),
        });
      }
    } else {
      timer.mark('linked_cursos_skipped', {
        reason: shouldExposePlanAccion
          ? 'no_linked_course_ids'
          : 'ai_generating',
        planItems: planAccion.length,
      });
    }

    const onboardingCompleted = usuario.onboarding_status === 'COMPLETED';

    const ubicacionCompleted = Boolean(usuario.home_cluster);

    const whatsappCompleted = Boolean(
      usuario.whatsapp_codigo && usuario.whatsapp_numero,
    );

    let perfilCompletado = 0;

    if (onboardingCompleted) perfilCompletado += 50;
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

    const fallbackGapItems: unknown[] = [];

    const matchPerfil =
      gapPorcentual != null
        ? clampPercent(100 - gapPorcentual)
        : clampPercent(Number(usuario.confianza ?? 0));

    const notificacionesNoLeidas = 0;
    const perfilMovilidad = null;

    timer.mark('response_ready', {
      degradedSections,
      planItems: shouldExposePlanAccion ? planAccion.length : 0,
      storedPlanItems: planAccion.length,
      linkedCursoIds: linkedCursoIds.length,
      areasInteres: areasInteres.length,
      userSkills: userSkills.length,
      recentCheckins: recentCheckins.length,
      hasOrientacion: Boolean(orientacion),
      hasTodayCheckin: Boolean(todayCheckin),
      perfilCompletado,
      matchPerfil,
      aiRecommendationsStatus,
      aiRecommendationsReady: aiRecommendationsStatus === 'ready',
      orientacionConfianza,
    });

    return NextResponse.json({
      success: true,
      requestId,
      degradedSections,
      aiRecommendationsReady: aiRecommendationsStatus === 'ready',
      aiRecommendationsStatus,
      perfil_completado: perfilCompletado,
      match_perfil: matchPerfil,
      perfil_breakdown: {
        onboarding: onboardingCompleted,
        movilidad: false,
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
      planAccion: shouldExposePlanAccion
        ? planAccion.map((item) => {
            const linkedCurso = item.curso_vinculado_id
              ? linkedCursosById.get(item.curso_vinculado_id)
              : null;

            return {
              plan_item_id: item.plan_item_id,
              titulo: item.titulo,
              prioridad: item.prioridad,
              completado: item.completado,
              orden: item.orden,
              accion_label: item.accion_label,
              curso: linkedCurso
                ? {
                    curso_id: linkedCurso.curso_id,
                    titulo: linkedCurso.titulo,
                    url_externa: linkedCurso.url_externa,
                    plataforma: linkedCurso.plataforma,
                    tipo: linkedCurso.tipo,
                    hasInternalContent: linkedCurso.hasInternalContent,
                  }
                : null,
            };
          })
        : [],
      bienestar: {
        notaPromedio,
        totalCheckins: recentCheckins.length,
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
    timer.mark('request_error', {
      userId: debugUserId,
      error: getErrorSummary(error),
    });

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
