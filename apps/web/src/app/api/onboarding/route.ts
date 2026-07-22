import { NextResponse } from 'next/server';
import { getTranslations } from 'next-intl/server';
import { onboardingSchema } from '@appbit/shared-schemas';
import { dbClient } from '../../../server/clients/db.client';
import {
  IdiomaAppEnum,
  EstadoHabilidadEnum,
  NivelIdiomaEnum,
} from '../../../server/generated/prisma';
import type { Prisma } from '../../../server/generated/prisma';
import { getCurrentAuthUser } from '@/src/server/auth/get-current-auth-user';
import {
  apiErrorResponse,
  formatZodFieldErrors,
  getRequestId,
  logApiError,
} from '@/src/server/api/api-error';
import { getUserSkillsMatch } from '@/src/server/progress/skill-progress';

export const dynamic = 'force-dynamic';

const ONBOARDING_API_PERF_LOGS_ENABLED =
  process.env.NODE_ENV !== 'production' ||
  process.env.ONBOARDING_PERF_LOGS === 'true';

/**
 * AI real queda prendido por default, pero corre en background.
 * Solo se apaga explícitamente con ONBOARDING_AI_BACKGROUND=false.
 */
const AI_ONBOARDING_BACKGROUND_ENABLED =
  process.env.ONBOARDING_AI_BACKGROUND !== 'false';

const MOBILITY_BACKGROUND_ENABLED =
  process.env.ONBOARDING_MOBILITY_BACKGROUND === 'true';

const AI_ONBOARDING_TIMEOUT_MS = Number(
  process.env.ONBOARDING_AI_TIMEOUT_MS ?? 10000,
);

type SupportedLocale = 'es' | 'pt';

type DashboardTranslator = (
  key: string,
  values?: Record<string, string | number>,
) => string;

const NIVEL_IDIOMA_MAP: Partial<Record<string, NivelIdiomaEnum>> = {
  A1: NivelIdiomaEnum.A1_Basico,
  A2: NivelIdiomaEnum.A2_Elemental,
  B1: NivelIdiomaEnum.B1_Intermedio,
  B2: NivelIdiomaEnum.B2_Avanzado,
  C1: NivelIdiomaEnum.C1_Fluido,
  C2: NivelIdiomaEnum.C2_Profesional,
  Nativo: NivelIdiomaEnum.Nativo,
};

const FALLBACK_PLAN_AREA_LABEL_KEYS: Partial<Record<string, string>> = {
  Data_Analytics: 'fallbackPlanAreaDataAnalytics',
  Desarrollo_Web: 'fallbackPlanAreaDesarrolloWeb',
  UX_UI_Design: 'fallbackPlanAreaUxUiDesign',
  Ciberseguridad: 'fallbackPlanAreaCiberseguridad',
  Cloud_DevOps: 'fallbackPlanAreaCloudDevOps',
  Inteligencia_Artificial: 'fallbackPlanAreaInteligenciaArtificial',
  Marketing_Digital: 'fallbackPlanAreaMarketingDigital',
  Product_Management: 'fallbackPlanAreaProductManagement',
};

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

function logOnboardingApiPerf(
  event: string,
  context: Record<string, unknown> = {},
) {
  if (!ONBOARDING_API_PERF_LOGS_ENABLED) {
    return;
  }

  console.info(
    JSON.stringify({
      level: 'info',
      scope: 'onboarding-api-perf',
      route: 'POST /api/onboarding',
      event,
      timestamp: new Date().toISOString(),
      ...context,
    }),
  );
}

function logOnboardingWarn(context: Record<string, unknown>) {
  console.warn(
    JSON.stringify({
      level: 'warn',
      route: 'POST /api/onboarding',
      timestamp: new Date().toISOString(),
      ...context,
    }),
  );
}

function createOnboardingApiTimer(requestId: string) {
  const requestStartedAt = getServerNowMs();

  return {
    mark(event: string, context: Record<string, unknown> = {}) {
      logOnboardingApiPerf(event, {
        requestId,
        elapsedMs: getServerNowMs() - requestStartedAt,
        ...context,
      });
    },

    async measure<T>(section: string, run: () => Promise<T>): Promise<T> {
      const sectionStartedAt = getServerNowMs();

      this.mark('section_start', { section });

      try {
        const value = await run();

        this.mark('section_done', {
          section,
          durationMs: getServerNowMs() - sectionStartedAt,
        });

        return value;
      } catch (error) {
        this.mark('section_error', {
          section,
          durationMs: getServerNowMs() - sectionStartedAt,
          error: getErrorSummary(error),
        });

        throw error;
      }
    },
  };
}

function normalizeNivelIdioma(nivel: string): NivelIdiomaEnum {
  return NIVEL_IDIOMA_MAP[nivel] ?? NivelIdiomaEnum.C1_Fluido;
}

function getAuthDisplayName(authUser: {
  email?: string | null;
  user_metadata?: Record<string, unknown>;
}) {
  const metadata = authUser.user_metadata ?? {};

  const fullName =
    typeof metadata.full_name === 'string'
      ? metadata.full_name
      : typeof metadata.name === 'string'
        ? metadata.name
        : null;

  if (fullName && fullName.trim().length >= 2) {
    return fullName.trim();
  }

  if (authUser.email) {
    return authUser.email.split('@')[0];
  }

  return 'Usuario BiT';
}

function getAvatarUrl(authUser: { user_metadata?: Record<string, unknown> }) {
  const avatarUrl = authUser.user_metadata?.avatar_url;

  return typeof avatarUrl === 'string' ? avatarUrl : null;
}

function getRequestLocale(rawBody: unknown): SupportedLocale {
  if (!rawBody || typeof rawBody !== 'object') {
    return 'es';
  }

  const locale = (rawBody as { locale?: unknown }).locale;

  return locale === 'pt' ? 'pt' : 'es';
}

function normalizeOnboardingRawBody(rawBody: unknown) {
  if (!rawBody || typeof rawBody !== 'object' || Array.isArray(rawBody)) {
    return rawBody;
  }

  const normalizedBody: Record<string, unknown> = {
    ...(rawBody as Record<string, unknown>),
  };

  if (
    normalizedBody.whatsappCodigo === '' &&
    normalizedBody.whatsappNumero === ''
  ) {
    normalizedBody.whatsappCodigo = undefined;
    normalizedBody.whatsappNumero = undefined;
  }

  return normalizedBody;
}

function getFallbackAreaLabel(params: {
  tDashboard: DashboardTranslator;
  areasInteres: string[];
}) {
  const firstArea = params.areasInteres[0];

  if (!firstArea) {
    return params.tDashboard('fallbackPlanAreaDefault');
  }

  const areaLabelKey = FALLBACK_PLAN_AREA_LABEL_KEYS[firstArea];

  if (!areaLabelKey) {
    return firstArea.replaceAll('_', ' ');
  }

  return params.tDashboard(areaLabelKey);
}

function getFallbackPlanItems(params: {
  tDashboard: DashboardTranslator;
  nivelExperienciaTecnologia: string;
  areasInteres: string[];
}) {
  const area = getFallbackAreaLabel({
    tDashboard: params.tDashboard,
    areasInteres: params.areasInteres,
  });

  const isFromZero = params.nivelExperienciaTecnologia === 'Desde_cero';

  return [
    {
      titulo: params.tDashboard(
        isFromZero
          ? 'fallbackPlanFromZeroStep1'
          : 'fallbackPlanWithExperienceStep1',
        { area },
      ),
      prioridad: 'Alta_prioridad' as const,
      accion_label: params.tDashboard('fallbackPlanActionViewLearning'),
      orden: 1,
    },
    {
      titulo: params.tDashboard(
        isFromZero
          ? 'fallbackPlanFromZeroStep2'
          : 'fallbackPlanWithExperienceStep2',
      ),
      prioridad: 'Alta_prioridad' as const,
      accion_label: params.tDashboard('fallbackPlanActionContinueLearning'),
      orden: 2,
    },
    {
      titulo: params.tDashboard(
        isFromZero
          ? 'fallbackPlanFromZeroStep3'
          : 'fallbackPlanWithExperienceStep3',
      ),
      prioridad: 'Media_prioridad' as const,
      accion_label: params.tDashboard('fallbackPlanActionViewPlan'),
      orden: 3,
    },
    {
      titulo: params.tDashboard('fallbackPlanWellbeingStep'),
      prioridad: 'Media_prioridad' as const,
      accion_label: params.tDashboard('fallbackPlanActionCheckin'),
      orden: 4,
    },
    {
      titulo: params.tDashboard('fallbackPlanProgressStep'),
      prioridad: 'Media_prioridad' as const,
      accion_label: params.tDashboard('fallbackPlanActionReviewProgress'),
      orden: 5,
    },
  ];
}

function isAiServicePointingToCurrentApp(params: {
  requestUrl: string;
  aiServiceUrl: string;
}) {
  try {
    const requestOrigin = new URL(params.requestUrl).origin;
    const aiOrigin = new URL(params.aiServiceUrl).origin;

    return requestOrigin === aiOrigin;
  } catch {
    return false;
  }
}

async function triggerAiOnboardingRecommendations(params: {
  requestId: string;
  aiServiceUrl: string;
  usuarioId: string;
  data: Record<string, unknown>;
  locale: SupportedLocale;
  nivelInicial: 'sin_conocimiento' | 'con_conocimientos_previos';
  gapInicial: number | null;
}) {
  const aiStartedAt = getServerNowMs();

  try {
    logOnboardingApiPerf('ai_background_start', {
      requestId: params.requestId,
      usuarioId: params.usuarioId,
      aiServiceUrl: params.aiServiceUrl,
      timeoutMs: AI_ONBOARDING_TIMEOUT_MS,
    });

    const aiResponse = await fetch(`${params.aiServiceUrl}/api/onboarding`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-request-id': params.requestId,
      },
      body: JSON.stringify({
        usuarioId: params.usuarioId,
        ...params.data,
        locale: params.locale,
        nivel_inicial: params.nivelInicial,
        gap_inicial: params.gapInicial,
      }),
      signal: AbortSignal.timeout(AI_ONBOARDING_TIMEOUT_MS),
    });

    const aiDurationMs = getServerNowMs() - aiStartedAt;
    const aiResponseText = await aiResponse.text().catch(() => '');

    if (!aiResponse.ok) {
      logOnboardingWarn({
        requestId: params.requestId,
        message: 'AI service returned non-OK response in background',
        context: {
          code: 'AI_SERVICE_NON_OK_BACKGROUND',
          aiServiceUrl: params.aiServiceUrl,
          usuarioId: params.usuarioId,
          status: aiResponse.status,
          statusText: aiResponse.statusText,
          durationMs: aiDurationMs,
          responseBody: aiResponseText.slice(0, 3000),
        },
      });

      return;
    }

    logOnboardingApiPerf('ai_background_done', {
      requestId: params.requestId,
      usuarioId: params.usuarioId,
      status: aiResponse.status,
      durationMs: aiDurationMs,
      responseBody: aiResponseText.slice(0, 1000),
    });
  } catch (error: unknown) {
    const aiDurationMs = getServerNowMs() - aiStartedAt;

    logOnboardingWarn({
      requestId: params.requestId,
      message: 'AI service unavailable in background',
      error: getErrorSummary(error),
      context: {
        code: 'AI_SERVICE_UNAVAILABLE_BACKGROUND',
        aiServiceUrl: params.aiServiceUrl,
        usuarioId: params.usuarioId,
        durationMs: aiDurationMs,
      },
    });
  }
}

async function assignPerfilMovilidadInBackground(params: {
  requestId: string;
  usuarioId: string;
}) {
  const startedAt = getServerNowMs();

  try {
    logOnboardingApiPerf('mobility_background_start', {
      requestId: params.requestId,
      usuarioId: params.usuarioId,
    });

    const perfilMovilidad = await dbClient.perfilMovilidad.findFirst({
      where: { usuario_id: null },
      select: { id: true },
    });

    if (!perfilMovilidad) {
      logOnboardingApiPerf('mobility_background_skipped', {
        requestId: params.requestId,
        usuarioId: params.usuarioId,
        reason: 'no_unassigned_profile',
      });

      return;
    }

    await dbClient.perfilMovilidad.update({
      where: { id: perfilMovilidad.id },
      data: { usuario_id: params.usuarioId },
      select: { id: true },
    });

    logOnboardingApiPerf('mobility_background_done', {
      requestId: params.requestId,
      usuarioId: params.usuarioId,
      durationMs: getServerNowMs() - startedAt,
    });
  } catch (error) {
    logOnboardingWarn({
      requestId: params.requestId,
      message: 'Mobility profile assignment failed in background',
      error: getErrorSummary(error),
      context: {
        usuarioId: params.usuarioId,
        durationMs: getServerNowMs() - startedAt,
      },
    });
  }
}

export async function POST(request: Request) {
  const requestId = getRequestId(request);
  const timer = createOnboardingApiTimer(requestId);

  timer.mark('request_start');

  try {
    const authUser = await timer.measure('auth_user', () =>
      getCurrentAuthUser(),
    );

    if (!authUser) {
      timer.mark('request_unauthorized');

      return NextResponse.json(
        {
          success: false,
          message: 'Unauthorized',
        },
        { status: 401 },
      );
    }

    if (!authUser.email) {
      timer.mark('request_missing_email');

      return NextResponse.json(
        {
          success: false,
          message: 'El usuario autenticado no tiene email.',
        },
        { status: 400 },
      );
    }

    let rawBody: unknown;

    try {
      rawBody = await timer.measure('parse_json', () => request.json());
    } catch (error) {
      logApiError({
        route: 'POST /api/onboarding',
        requestId,
        error,
        context: {
          step: 'parse_json',
        },
      });

      return apiErrorResponse({
        status: 400,
        code: 'INVALID_JSON',
        message:
          'No pudimos leer los datos enviados. Revisá el formulario e intentá de nuevo.',
        requestId,
      });
    }

    const normalizedBody = normalizeOnboardingRawBody(rawBody);
    const requestLocale = getRequestLocale(normalizedBody);

    const parsed = onboardingSchema.safeParse(normalizedBody);

    if (!parsed.success) {
      const fieldErrors = formatZodFieldErrors(parsed.error, {
        nombreCompleto: 'Nombre completo',
        fechaNacimiento: 'Fecha de nacimiento',
        genero: 'Género',
        pais: 'País',
        provinciaEstado: 'Provincia / Estado',
        ciudad: 'Ciudad',
        zonaResidencia: 'Zona de residencia',
        nivelEducacion: 'Nivel educativo',
        momentoProfesional: 'Momento profesional',
        areasInteres: 'Áreas de interés',
        nivelExperienciaTecnologia: 'Nivel de experiencia',
        habilidadesTecnicas: 'Habilidades técnicas',
        habilidadesBlandas: 'Habilidades blandas',
        idiomas: 'Idiomas',
        disponibilidad: 'Disponibilidad',
        ubicacionTrabajo: 'Ubicación de trabajo',
        tipoConexion: 'Tipo de conexión',
        dispositivos: 'Dispositivos',
        objetivos: 'Objetivos',
      });

      logApiError({
        route: 'POST /api/onboarding',
        requestId,
        error: parsed.error,
        context: {
          code: 'VALIDATION_ERROR',
          fields: Object.keys(fieldErrors),
        },
      });

      return apiErrorResponse({
        status: 400,
        code: 'VALIDATION_ERROR',
        message: 'Hay campos obligatorios o inválidos en el onboarding.',
        requestId,
        details: {
          fieldErrors,
        },
      });
    }

    const data = parsed.data;

    timer.mark('validation_done', {
      locale: requestLocale,
      areasInteres: data.areasInteres.length,
      nivelExperienciaTecnologia: data.nivelExperienciaTecnologia,
      habilidadesTecnicas: data.habilidadesTecnicas.length,
      habilidadesBlandas: data.habilidadesBlandas.length,
    });

    const authUid = authUser.id;
    const email = authUser.email;
    const nombreCompleto = getAuthDisplayName(authUser);
    const avatarUrl = getAvatarUrl(authUser);
    const idiomaApp =
      requestLocale === 'pt' ? IdiomaAppEnum.pt : IdiomaAppEnum.es;

    const tDashboardPromise = timer.measure('dashboard_translations', () =>
      getTranslations({
        locale: requestLocale,
        namespace: 'Dashboard',
      }),
    ) as Promise<DashboardTranslator>;

    const existingUsuarioPromise = timer.measure('usuario_lookup', () =>
      dbClient.usuarios.findFirst({
        where: {
          OR: [{ auth_uid: authUid }, { email }],
        },
        select: {
          usuario_id: true,
        },
      }),
    );

    const habilidadesCatalogoPromise =
      data.areasInteres.length > 0
        ? timer.measure('habilidades_catalogo', () =>
            dbClient.habilidadesMercado.findMany({
              where: {
                area_principal: {
                  in: data.areasInteres,
                },
              },
              select: {
                habilidad_id: true,
                nombre: true,
              },
            }),
          )
        : Promise.resolve([]);

    const [tDashboard, existingUsuario, habilidadesCatalogo] =
      await Promise.all([
        tDashboardPromise,
        existingUsuarioPromise,
        habilidadesCatalogoPromise,
      ]);

    const isNewUsuario = !existingUsuario;

    const baseData = {
      fecha_nacimiento: new Date(data.fechaNacimiento),
      genero: data.genero,
      pais: data.pais,
      provincia_estado: data.provinciaEstado ?? null,
      ciudad: data.ciudad,
      zona_residencia: data.zonaResidencia ?? null,
      whatsapp_codigo: data.whatsappCodigo ?? null,
      whatsapp_numero: data.whatsappNumero ?? null,
      idioma_app: idiomaApp,
      avatar_url: avatarUrl,
      perfil_completado: 100,
      onboarding_status: 'COMPLETED' as const,
      actualizado_en: new Date(),
    };

    const usuario = await timer.measure(
      isNewUsuario ? 'usuario_create' : 'usuario_update',
      () =>
        isNewUsuario
          ? dbClient.usuarios.create({
              data: {
                ...baseData,
                auth_uid: authUid,
                email,
                nombre_completo: nombreCompleto,
              },
              select: {
                usuario_id: true,
              },
            })
          : dbClient.usuarios.update({
              where: {
                usuario_id: existingUsuario.usuario_id,
              },
              data: {
                ...baseData,
                auth_uid: authUid,
                email,
                nombre_completo: nombreCompleto,
              },
              select: {
                usuario_id: true,
              },
            }),
    );

    const usuarioId = usuario.usuario_id;

    timer.mark('usuario_saved', {
      usuarioId,
      isNewUsuario,
      habilidadesCatalogo: habilidadesCatalogo.length,
    });

    const relationOps: Prisma.PrismaPromise<unknown>[] = [];

    if (!isNewUsuario) {
      timer.mark('relation_cleanup_existing_user_queued', {
        usuarioId,
      });

      relationOps.push(
        dbClient.usuarioNivelEducacion.deleteMany({
          where: { usuario_id: usuarioId },
        }),
        dbClient.usuarioMomentoProfesional.deleteMany({
          where: { usuario_id: usuarioId },
        }),
        dbClient.usuarioAreasInteres.deleteMany({
          where: { usuario_id: usuarioId },
        }),
        dbClient.usuarioIdiomas.deleteMany({
          where: { usuario_id: usuarioId },
        }),
        dbClient.usuarioDisponibilidad.deleteMany({
          where: { usuario_id: usuarioId },
        }),
        dbClient.usuarioUbicacionTrabajo.deleteMany({
          where: { usuario_id: usuarioId },
        }),
        dbClient.usuarioHabilidades.deleteMany({
          where: { usuario_id: usuarioId },
        }),
        dbClient.usuarioObjetivos.deleteMany({
          where: { usuario_id: usuarioId },
        }),
        dbClient.usuarioDispositivos.deleteMany({
          where: { usuario_id: usuarioId },
        }),
        dbClient.usuarioTipoConexion.deleteMany({
          where: { usuario_id: usuarioId },
        }),
        dbClient.planAccion.deleteMany({
          where: { usuario_id: usuarioId },
        }),
      );
    } else {
      timer.mark('relation_cleanup_skipped_new_user', {
        usuarioId,
      });
    }

    if (data.nivelEducacion.length > 0) {
      relationOps.push(
        dbClient.usuarioNivelEducacion.createMany({
          data: data.nivelEducacion.map((nivel) => ({
            usuario_id: usuarioId,
            nivel_educacion: nivel,
          })),
        }),
      );
    }

    if (data.momentoProfesional.length > 0) {
      relationOps.push(
        dbClient.usuarioMomentoProfesional.createMany({
          data: data.momentoProfesional.map((momento) => ({
            usuario_id: usuarioId,
            momento_profesional: momento,
          })),
        }),
      );
    }

    if (data.areasInteres.length > 0) {
      relationOps.push(
        dbClient.usuarioAreasInteres.createMany({
          data: data.areasInteres.map((area) => ({
            usuario_id: usuarioId,
            area,
          })),
        }),
      );
    }

    if (data.idiomas.length > 0) {
      relationOps.push(
        dbClient.usuarioIdiomas.createMany({
          data: data.idiomas.map(({ idioma, nivel }) => ({
            usuario_id: usuarioId,
            idioma,
            nivel: normalizeNivelIdioma(nivel),
          })),
        }),
      );
    }

    if (data.disponibilidad.length > 0) {
      relationOps.push(
        dbClient.usuarioDisponibilidad.createMany({
          data: data.disponibilidad.map((disp) => ({
            usuario_id: usuarioId,
            disponibilidad: disp,
          })),
        }),
      );
    }

    if (data.ubicacionTrabajo.length > 0) {
      relationOps.push(
        dbClient.usuarioUbicacionTrabajo.createMany({
          data: data.ubicacionTrabajo.map((ubicacion) => ({
            usuario_id: usuarioId,
            ubicacion,
          })),
        }),
      );
    }

    if (habilidadesCatalogo.length > 0) {
  const selectedSkillNames = new Set<string>(data.habilidadesTecnicas);

  relationOps.push(
    dbClient.usuarioHabilidades.createMany({
      data: habilidadesCatalogo.map((habilidad) => {
        const acquired =
          data.nivelExperienciaTecnologia !== 'Desde_cero' &&
          selectedSkillNames.has(habilidad.nombre);

        return {
          usuario_id: usuarioId,
          habilidad_id: habilidad.habilidad_id,
          estado: acquired
            ? EstadoHabilidadEnum.Adquirida
            : EstadoHabilidadEnum.Faltante,
          progreso_porcentaje: acquired ? 100 : 0,
        };
      }),
      skipDuplicates: true,
    }),
  );
}

    if (data.objetivos.length > 0) {
      relationOps.push(
        dbClient.usuarioObjetivos.createMany({
          data: data.objetivos.map((objetivo) => ({
            usuario_id: usuarioId,
            objetivo,
          })),
        }),
      );
    }

    if (data.dispositivos.length > 0) {
      relationOps.push(
        dbClient.usuarioDispositivos.createMany({
          data: data.dispositivos.map((dispositivo) => ({
            usuario_id: usuarioId,
            dispositivo,
          })),
        }),
      );
    }

    if (data.tipoConexion.length > 0) {
      relationOps.push(
        dbClient.usuarioTipoConexion.createMany({
          data: data.tipoConexion.map((tipo) => ({
            usuario_id: usuarioId,
            tipo_conexion: tipo,
          })),
          skipDuplicates: true,
        }),
      );
    }

    const fallbackPlanItems = getFallbackPlanItems({
      tDashboard,
      nivelExperienciaTecnologia: data.nivelExperienciaTecnologia,
      areasInteres: data.areasInteres,
    });

    relationOps.push(
      dbClient.planAccion.createMany({
        data: fallbackPlanItems.map((item) => ({
          usuario_id: usuarioId,
          titulo: item.titulo,
          prioridad: item.prioridad,
          accion_label: item.accion_label,
          orden: item.orden,
          completado: false,
        })),
      }),
    );

    await timer.measure('relation_writes_transaction', async () => {
      await dbClient.$transaction(relationOps);
    });

    timer.mark('db_saved', {
      usuarioId,
      isNewUsuario,
      relationOps: relationOps.length,
      fallbackPlanItems: fallbackPlanItems.length,
    });

    if (MOBILITY_BACKGROUND_ENABLED) {
      timer.mark('mobility_background_scheduled', {
        usuarioId,
      });

      setTimeout(() => {
        void assignPerfilMovilidadInBackground({
          requestId,
          usuarioId,
        });
      }, 2500);
    } else {
      timer.mark('mobility_background_skipped_disabled', {
        usuarioId,
      });
    }

    const aiServiceUrl = process.env.AI_SERVICE_URL;

    if (!aiServiceUrl) {
      timer.mark('ai_skipped_no_url', {
        usuarioId,
      });
    } else if (
      isAiServicePointingToCurrentApp({
        requestUrl: request.url,
        aiServiceUrl,
      })
    ) {
      timer.mark('ai_skipped_self_url', {
        usuarioId,
        aiServiceUrl,
      });

      logOnboardingWarn({
        requestId,
        message:
          'AI_SERVICE_URL apunta al mismo origen del web app. Se saltea AI para evitar timeout/recursión.',
        context: {
          aiServiceUrl,
          usuarioId,
        },
      });
    } else if (!AI_ONBOARDING_BACKGROUND_ENABLED) {
      timer.mark('ai_skipped_background_disabled', {
        usuarioId,
        aiServiceUrl,
      });
    } else {
      timer.mark('ai_background_scheduled', {
        usuarioId,
        aiServiceUrl,
        timeoutMs: AI_ONBOARDING_TIMEOUT_MS,
      });

      setTimeout(() => {
        void triggerAiOnboardingRecommendations({
          requestId,
          aiServiceUrl,
          usuarioId,
          data: data as unknown as Record<string, unknown>,
          locale: requestLocale,
          nivelInicial:
            data.nivelExperienciaTecnologia === 'Desde_cero'
              ? 'sin_conocimiento'
              : 'con_conocimientos_previos',
          gapInicial:
            data.nivelExperienciaTecnologia === 'Desde_cero' ? 100 : null,
        });
      }, 4000);
    }

    await dbClient.$transaction(async (tx) => {
  const initialMatch = await getUserSkillsMatch(tx, usuarioId);

  await tx.historialProgreso.createMany({
    data: [
      {
        usuario_id: usuarioId,
        tipo_evento: 'Onboarding',
        entidad_id: usuarioId,
        titulo: 'Onboarding completado',
        match_anterior: initialMatch,
        match_nuevo: initialMatch,
        metadatos: {},
      },
    ],
    skipDuplicates: true,
  });
});

timer.mark('response_ready', {
  usuarioId,
  fallbackPlanItems: fallbackPlanItems.length,
});

    return NextResponse.json({
      success: true,
      message: 'Onboarding completado exitosamente',
      userId: usuarioId,
      nextPath: '/dashboard',
      recommendations: {
        mode: 'fallback',
        planItems: fallbackPlanItems.length,
      },
      requestId,
    });
  } catch (error) {
    timer.mark('request_error', {
      error: getErrorSummary(error),
    });

    logApiError({
      route: 'POST /api/onboarding',
      requestId,
      error,
      context: {
        code: 'ONBOARDING_SAVE_FAILED',
      },
    });

    return apiErrorResponse({
      status: 500,
      code: 'ONBOARDING_SAVE_FAILED',
      message:
        'No pudimos guardar tu onboarding. Intentá de nuevo. Si vuelve a pasar, reportá el código de error.',
      requestId,
    });
  }
}
