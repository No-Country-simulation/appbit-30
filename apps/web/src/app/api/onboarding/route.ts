import { NextResponse } from 'next/server';
import { onboardingSchema } from '@appbit/shared-schemas';
import { dbClient } from '../../../server/clients/db.client';
import {
  IdiomaAppEnum,
  EstadoHabilidadEnum,
  NivelIdiomaEnum,
} from '../../../server/generated/prisma';
import { getCurrentAuthUser } from '@/src/server/auth/get-current-auth-user';
import {
  apiErrorResponse,
  formatZodFieldErrors,
  getRequestId,
  logApiError,
} from '@/src/server/api/api-error';

const NIVEL_IDIOMA_MAP: Partial<Record<string, NivelIdiomaEnum>> = {
  A1: NivelIdiomaEnum.A1_Basico,
  A2: NivelIdiomaEnum.A2_Elemental,
  B1: NivelIdiomaEnum.B1_Intermedio,
  B2: NivelIdiomaEnum.B2_Avanzado,
  C1: NivelIdiomaEnum.C1_Fluido,
};

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

function getRequestLocale(rawBody: unknown): 'es' | 'pt' {
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

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const requestId = getRequestId(request);

  try {
    const authUser = await getCurrentAuthUser();

    if (!authUser) {
      return NextResponse.json(
        {
          success: false,
          message: 'Unauthorized',
        },
        { status: 401 },
      );
    }

    if (!authUser.email) {
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
      rawBody = await request.json();
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

    const authUid = authUser.id;
    const email = authUser.email;
    const nombreCompleto = getAuthDisplayName(authUser);
    const avatarUrl = getAvatarUrl(authUser);
    const idiomaApp =
      requestLocale === 'pt' ? IdiomaAppEnum.pt : IdiomaAppEnum.es;

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

    const result = await dbClient.$transaction(
      async (tx) => {
        let usuario = await tx.usuarios.findUnique({
          where: { auth_uid: authUid },
        });

        if (!usuario) {
          usuario = await tx.usuarios.findUnique({
            where: { email },
          });
        }

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

        if (usuario) {
          usuario = await tx.usuarios.update({
            where: { usuario_id: usuario.usuario_id },
            data: {
              ...baseData,
              auth_uid: authUid,
              email,
              nombre_completo: nombreCompleto,
            },
          });
        } else {
          usuario = await tx.usuarios.create({
            data: {
              ...baseData,
              auth_uid: authUid,
              email,
              nombre_completo: nombreCompleto,
            },
          });
        }

        const usuarioId = usuario.usuario_id;

        await tx.usuarioNivelEducacion.deleteMany({
          where: { usuario_id: usuarioId },
        });

        if (data.nivelEducacion.length > 0) {
          await tx.usuarioNivelEducacion.createMany({
            data: data.nivelEducacion.map((nivel) => ({
              usuario_id: usuarioId,
              nivel_educacion: nivel,
            })),
          });
        }

        await tx.usuarioMomentoProfesional.deleteMany({
          where: { usuario_id: usuarioId },
        });

        if (data.momentoProfesional.length > 0) {
          await tx.usuarioMomentoProfesional.createMany({
            data: data.momentoProfesional.map((momento) => ({
              usuario_id: usuarioId,
              momento_profesional: momento,
            })),
          });
        }

        await tx.usuarioAreasInteres.deleteMany({
          where: { usuario_id: usuarioId },
        });

        if (data.areasInteres.length > 0) {
          await tx.usuarioAreasInteres.createMany({
            data: data.areasInteres.map((area) => ({
              usuario_id: usuarioId,
              area,
            })),
          });
        }

        await tx.usuarioIdiomas.deleteMany({
          where: { usuario_id: usuarioId },
        });

        if (data.idiomas.length > 0) {
          await tx.usuarioIdiomas.createMany({
            data: data.idiomas.map(({ idioma, nivel }) => ({
              usuario_id: usuarioId,
              idioma,
              nivel: normalizeNivelIdioma(nivel),
            })),
          });
        }

        await tx.usuarioDisponibilidad.deleteMany({
          where: { usuario_id: usuarioId },
        });

        if (data.disponibilidad.length > 0) {
          await tx.usuarioDisponibilidad.createMany({
            data: data.disponibilidad.map((disp) => ({
              usuario_id: usuarioId,
              disponibilidad: disp,
            })),
          });
        }

        await tx.usuarioUbicacionTrabajo.deleteMany({
          where: { usuario_id: usuarioId },
        });

        if (data.ubicacionTrabajo.length > 0) {
          await tx.usuarioUbicacionTrabajo.createMany({
            data: data.ubicacionTrabajo.map((ubicacion) => ({
              usuario_id: usuarioId,
              ubicacion,
            })),
          });
        }

        const habilidadesCatalogo = await tx.habilidadesMercado.findMany({
          where: {
            area_principal: {
              in: data.areasInteres,
            },
          },
          select: {
            habilidad_id: true,
            nombre: true,
          },
        });

        await tx.usuarioHabilidades.deleteMany({
          where: {
            usuario_id: usuarioId,
          },
        });

        if (habilidadesCatalogo.length > 0) {
          const selectedSkillNames = new Set<string>(data.habilidadesTecnicas);

          await tx.usuarioHabilidades.createMany({
            data: habilidadesCatalogo.map((habilidad) => ({
              usuario_id: usuarioId,
              habilidad_id: habilidad.habilidad_id,
              estado:
                data.nivelExperienciaTecnologia === 'Desde_cero'
                  ? EstadoHabilidadEnum.Faltante
                  : selectedSkillNames.has(habilidad.nombre)
                    ? EstadoHabilidadEnum.Adquirida
                    : EstadoHabilidadEnum.Faltante,
            })),
            skipDuplicates: true,
          });
        }

        await tx.usuarioObjetivos.deleteMany({
          where: { usuario_id: usuarioId },
        });

        if (data.objetivos.length > 0) {
          await tx.usuarioObjetivos.createMany({
            data: data.objetivos.map((objetivo) => ({
              usuario_id: usuarioId,
              objetivo,
            })),
          });
        }

        await tx.usuarioDispositivos.deleteMany({
          where: { usuario_id: usuarioId },
        });

        if (data.dispositivos.length > 0) {
          await tx.usuarioDispositivos.createMany({
            data: data.dispositivos.map((dispositivo) => ({
              usuario_id: usuarioId,
              dispositivo,
            })),
          });
        }

        await tx.usuarioTipoConexion.deleteMany({
          where: { usuario_id: usuarioId },
        });

        if (data.tipoConexion.length > 0) {
          await tx.usuarioTipoConexion.createMany({
            data: data.tipoConexion.map((tipo) => ({
              usuario_id: usuarioId,
              tipo_conexion: tipo,
            })),
            skipDuplicates: true,
          });
        }

        const perfilMovilidad = await tx.perfilMovilidad.findFirst({
          where: { usuario_id: null },
        });

        if (perfilMovilidad) {
          await tx.perfilMovilidad.update({
            where: { id: perfilMovilidad.id },
            data: { usuario_id: usuarioId },
          });
        }

        return {
          usuarioId,
          onboardingCompleted: true,
        };
      },
      {
        maxWait: 10000,
        timeout: 30000,
      },
    );

    const aiServiceUrl = process.env.AI_SERVICE_URL;

    if (aiServiceUrl) {
      try {
        await fetch(`${aiServiceUrl}/api/onboarding`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            usuarioId: result.usuarioId,
            ...data,
            locale: requestLocale,
            nivel_inicial:
              data.nivelExperienciaTecnologia === 'Desde_cero'
                ? 'sin_conocimiento'
                : 'con_conocimientos_previos',
            gap_inicial:
              data.nivelExperienciaTecnologia === 'Desde_cero' ? 100 : null,
          }),
          signal: AbortSignal.timeout(20000),
        });
      } catch {
        console.warn(
          'ai-service no disponible, onboarding completado sin recomendaciones',
        );
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Onboarding completado exitosamente',
      userId: result.usuarioId,
      nextPath: '/dashboard',
    });
  } catch (error) {
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
