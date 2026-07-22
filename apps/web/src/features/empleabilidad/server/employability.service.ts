import { dbClient } from '@/src/server/clients/db.client';
import type {
  AreaInteresEnum,
  ModalidadVacanteEnum,
  Prisma,
} from '@/src/server/generated/prisma';
import type { VacanteItem } from '../types';
import { calculateWeightedVacancyMatch } from '@/src/server/progress/skill-progress';

export const AREA_VALUES = [
  'Data_Analytics',
  'Desarrollo_Web',
  'UX_UI_Design',
  'Ciberseguridad',
  'Cloud_DevOps',
  'Inteligencia_Artificial',
  'Marketing_Digital',
  'Product_Management',
] as const satisfies readonly AreaInteresEnum[];

export const MODALIDAD_VALUES = [
  'Presencial',
  'Hibrido',
  'Remoto',
] as const satisfies readonly ModalidadVacanteEnum[];

const AREA_LABELS: Record<AreaInteresEnum, string> = {
  Data_Analytics: 'Data & Analytics',
  Desarrollo_Web: 'Desarrollo Web',
  UX_UI_Design: 'UX / UI Design',
  Ciberseguridad: 'Ciberseguridad',
  Cloud_DevOps: 'Cloud & DevOps',
  Inteligencia_Artificial: 'Inteligencia Artificial',
  Marketing_Digital: 'Marketing Digital',
  Product_Management: 'Product Management',
};

const MODALIDAD_LABELS: Record<ModalidadVacanteEnum, string> = {
  Presencial: 'Presencial',
  Hibrido: 'Híbrido',
  Remoto: '100% Remoto',
};

const NIVEL_LABELS = {
  Jr_Entry_Level: 'Jr / Entry Level',
  Semi_Senior: 'Semi Senior',
  Senior: 'Senior',
} as const;

const VACANTE_INCLUDE = {
  empresa: true,
  requisitos: {
    include: { habilidad: true },
    orderBy: { prioridad: 'asc' },
  },
} satisfies Prisma.VacantesInclude;

type VacanteWithRelations = Prisma.VacantesGetPayload<{
  include: typeof VACANTE_INCLUDE;
}>;

export interface VacanteFilters {
  area?: AreaInteresEnum;
  modalidad?: ModalidadVacanteEnum;
  search?: string;
  page: number;
  limit: number;
}

export function calculateMatch(
  requisitos: Array<{ habilidad_id: string; prioridad: number }>,
  userSkillProgress: ReadonlyMap<string, number>,
) {
  return calculateWeightedVacancyMatch(
    requisitos.map((item) => ({
      skillId: item.habilidad_id,
      priority: item.prioridad,
    })),
    userSkillProgress,
  );
}

async function getUserSkillProgress(usuarioId: string) {
  const skills = await dbClient.usuarioHabilidades.findMany({
    where: { usuario_id: usuarioId },
    select: { habilidad_id: true, progreso_porcentaje: true },
  });

  return new Map(
    skills.map((item) => [item.habilidad_id, item.progreso_porcentaje]),
  );
}

async function getUserInterestAreas(usuarioId: string) {
  const areas = await dbClient.usuarioAreasInteres.findMany({
    where: { usuario_id: usuarioId },
    select: { area: true },
  });

  return new Set(areas.map((item) => item.area));
}

function stringArray(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === 'string')
    : [];
}

function mapVacante(
  vacante: VacanteWithRelations,
  userSkillProgress: ReadonlyMap<string, number>,
): VacanteItem {
  return {
    id: vacante.vacante_id,
    titulo: vacante.titulo,
    empresa: vacante.empresa.nombre,
    empresaDescripcion: vacante.empresa.descripcion,
    logoUrl: vacante.empresa.logo_url,
    area: AREA_LABELS[vacante.area],
    nivel: NIVEL_LABELS[vacante.nivel],
    modalidad: MODALIDAD_LABELS[vacante.modalidad],
    modalidadDetallada: vacante.detalle_modalidad,
    ubicacion: [vacante.ciudad, vacante.pais].filter(Boolean).join(', '),
    distancia: vacante.distancia_zona,
    matchPorcentaje: calculateMatch(vacante.requisitos, userSkillProgress),
    fechaPublicacion: vacante.fecha_publicacion.toISOString(),
    descripcion: vacante.descripcion,
    educacionRequerida: vacante.educacion_requerida
      ? [vacante.educacion_requerida]
      : [],
    experienciaSolicitada: vacante.experiencia_solicitada
      ? [vacante.experiencia_solicitada]
      : [],
    idioma: stringArray(vacante.idiomas_requeridos),
    jornada: vacante.jornada ? [vacante.jornada.replaceAll('_', ' ')] : [],
    skills: vacante.requisitos.map((item) => {
      const progress = Math.max(
        0,
        Math.min(100, userSkillProgress.get(item.habilidad_id) ?? 0),
      );

      return {
        nombre: item.habilidad.nombre,
        laTienes: progress === 100,
        progresoPorcentaje: progress,
      };
    }),
  };
}

export async function listVacantes(
  usuarioId: string,
  filters: VacanteFilters,
) {
  const search = filters.search?.trim();
  const [userSkillProgress, userInterestAreas] = await Promise.all([
    getUserSkillProgress(usuarioId),
    getUserInterestAreas(usuarioId),
  ]);
  const allowedAreas = filters.area
    ? userInterestAreas.has(filters.area)
      ? [filters.area]
      : []
    : Array.from(userInterestAreas);
  const where: Prisma.VacantesWhereInput = {
    activa: true,
    area: { in: allowedAreas },
    modalidad: filters.modalidad,
    ...(search
      ? {
          OR: [
            { titulo: { contains: search, mode: 'insensitive' } },
            { descripcion: { contains: search, mode: 'insensitive' } },
            {
              empresa: {
                nombre: { contains: search, mode: 'insensitive' },
              },
            },
          ],
        }
      : {}),
  };

  const vacantes = await dbClient.vacantes.findMany({
    where,
    include: VACANTE_INCLUDE,
    orderBy: { fecha_publicacion: 'desc' },
  });

  const mapped = vacantes
    .map((vacante) => mapVacante(vacante, userSkillProgress))
    .filter(
      (vacante) =>
        vacante.matchPorcentaje !== null && vacante.matchPorcentaje >= 50,
    )
    .sort((a, b) => {
      const matchDifference =
        (b.matchPorcentaje ?? 0) - (a.matchPorcentaje ?? 0);

      return (
        matchDifference ||
        b.fechaPublicacion.localeCompare(a.fechaPublicacion)
      );
    });
  const start = (filters.page - 1) * filters.limit;

  return {
    data: mapped.slice(start, start + filters.limit),
    pagination: {
      page: filters.page,
      limit: filters.limit,
      total: mapped.length,
      totalPages: Math.ceil(mapped.length / filters.limit),
    },
  };
}

export async function getVacanteById(usuarioId: string, vacanteId: string) {
  const [vacante, userSkillProgress] = await Promise.all([
    dbClient.vacantes.findFirst({
      where: { vacante_id: vacanteId, activa: true },
      include: VACANTE_INCLUDE,
    }),
    getUserSkillProgress(usuarioId),
  ]);

  return vacante ? mapVacante(vacante, userSkillProgress) : null;
}

export async function calculateVacanteMatch(
  usuarioId: string,
  vacanteId: string,
) {
  const [vacante, userSkillProgress] = await Promise.all([
    dbClient.vacantes.findFirst({
      where: { vacante_id: vacanteId, activa: true },
      select: {
        vacante_id: true,
        requisitos: { select: { habilidad_id: true, prioridad: true } },
      },
    }),
    getUserSkillProgress(usuarioId),
  ]);

  return vacante
    ? { match: calculateMatch(vacante.requisitos, userSkillProgress) }
    : null;
}
