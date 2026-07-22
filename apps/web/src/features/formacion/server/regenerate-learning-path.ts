import { dbClient } from '@/src/server/clients/db.client';

export class LearningPathRegenerationError extends Error {
  constructor(
    readonly code: 'PROFILE_INCOMPLETE' | 'AI_SERVICE_UNAVAILABLE',
    message: string,
  ) {
    super(message);
    this.name = 'LearningPathRegenerationError';
  }
}

function isoDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

export async function regenerateLearningPath(params: {
  usuarioId: string;
  locale: string;
  requestId: string;
}) {
  const usuario = await dbClient.usuarios.findUnique({
    where: { usuario_id: params.usuarioId },
    select: {
      fecha_nacimiento: true,
      genero: true,
      pais: true,
      provincia_estado: true,
      ciudad: true,
      zona_residencia: true,
      usuario_nivel_educacion: { select: { nivel_educacion: true } },
      usuario_momento_profesional: {
        select: { momento_profesional: true },
      },
      usuario_areas_interes: { select: { area: true } },
      usuario_idiomas: { select: { idioma: true, nivel: true } },
      usuario_disponibilidad: { select: { disponibilidad: true } },
      usuario_ubicacion_trabajo: { select: { ubicacion: true } },
      usuario_objetivos: { select: { objetivo: true } },
      usuario_dispositivos: { select: { dispositivo: true } },
      usuario_tipo_conexion: { select: { tipo_conexion: true } },
      usuario_habilidades: {
        where: { progreso_porcentaje: { gt: 0 } },
        select: {
          progreso_porcentaje: true,
          habilidad: { select: { nombre: true } },
        },
      },
    },
  });

  if (!usuario || usuario.usuario_tipo_conexion.length === 0) {
    throw new LearningPathRegenerationError(
      'PROFILE_INCOMPLETE',
      'Completá tu perfil antes de actualizar las recomendaciones.',
    );
  }

  const aiServiceUrl = process.env.AI_SERVICE_URL;

  if (!aiServiceUrl) {
    throw new LearningPathRegenerationError(
      'AI_SERVICE_UNAVAILABLE',
      'El servicio de recomendaciones no está configurado.',
    );
  }

  const hasPriorKnowledge = usuario.usuario_habilidades.length > 0;
  let response: Response;

  try {
    response = await fetch(`${aiServiceUrl}/api/onboarding`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-request-id': params.requestId,
      },
      body: JSON.stringify({
      usuarioId: params.usuarioId,
      fechaNacimiento: isoDate(usuario.fecha_nacimiento),
      genero: usuario.genero,
      pais: usuario.pais,
      provinciaEstado: usuario.provincia_estado ?? undefined,
      ciudad: usuario.ciudad,
      zonaResidencia: usuario.zona_residencia ?? undefined,
      nivelEducacion: usuario.usuario_nivel_educacion.map(
        (item) => item.nivel_educacion,
      ),
      momentoProfesional: usuario.usuario_momento_profesional.map(
        (item) => item.momento_profesional,
      ),
      areasInteres: usuario.usuario_areas_interes.map((item) => item.area),
      idiomas: usuario.usuario_idiomas.map((item) => ({
        idioma: item.idioma,
        nivel: item.nivel,
      })),
      disponibilidad: usuario.usuario_disponibilidad.map(
        (item) => item.disponibilidad,
      ),
      ubicacionTrabajo: usuario.usuario_ubicacion_trabajo.map(
        (item) => item.ubicacion,
      ),
      nivelExperienciaTecnologia: hasPriorKnowledge
        ? 'Con_conocimientos_previos'
        : 'Desde_cero',
      habilidadesTecnicas: usuario.usuario_habilidades.map(
        (item) => item.habilidad.nombre,
      ),
      habilidadesBlandas: [],
      objetivos: usuario.usuario_objetivos.map((item) => item.objetivo),
      dispositivos: usuario.usuario_dispositivos.map(
        (item) => item.dispositivo,
      ),
      tipoConexion: usuario.usuario_tipo_conexion.map(
        (item) => item.tipo_conexion,
      ),
      locale: params.locale === 'pt' ? 'pt' : 'es',
      nivel_inicial: hasPriorKnowledge
        ? 'con_conocimientos_previos'
        : 'sin_conocimiento',
      gap_inicial: null,
      }),
      signal: AbortSignal.timeout(20_000),
    });
  } catch {
    throw new LearningPathRegenerationError(
      'AI_SERVICE_UNAVAILABLE',
      'No pudimos conectarnos con el servicio de recomendaciones.',
    );
  }

  if (!response.ok) {
    throw new LearningPathRegenerationError(
      'AI_SERVICE_UNAVAILABLE',
      'No pudimos actualizar las recomendaciones en este momento.',
    );
  }

  return response.json() as Promise<{
    success: boolean;
    orientacionId?: string;
    planAccionCount?: number;
  }>;
}
