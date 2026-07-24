import { dbClient } from '@/src/server/clients/db.client';
import type {
  AreaInteresEnum,
  EstadoHabilidadEnum,
  ModalidadVacanteEnum,
  Prisma,
} from '@/src/server/generated/prisma';
import {
  calculateWeightedVacancyMatch,
  clampPercent,
} from '@/src/server/progress/skill-progress';
import type {
  EmployabilityLocale,
  VacanteItem,
} from '../types';
import {
  listB2BJobs,
  normalizeSkillName,
} from './b2b-jobs.client';
import { meetsRecommendedMatch } from './match-policy';

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
  locale?: EmployabilityLocale;
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

function getSkillProgress(
  estado: EstadoHabilidadEnum,
  progresoPorcentaje: number,
) {
  if (estado === 'Adquirida') return 100;
  if (estado === 'Faltante') return 0;
  return clampPercent(progresoPorcentaje);
}

async function getUserSkillContext(usuarioId: string) {
  const skills = await dbClient.usuarioHabilidades.findMany({
    where: { usuario_id: usuarioId },
    select: {
      habilidad_id: true,
      estado: true,
      progreso_porcentaje: true,
      habilidad: { select: { nombre: true } },
    },
  });

  const byId = new Map<string, number>();
  const byName = new Map<string, number>();

  for (const skill of skills) {
    const progress = getSkillProgress(
      skill.estado,
      skill.progreso_porcentaje,
    );

    byId.set(skill.habilidad_id, progress);
    byName.set(normalizeSkillName(skill.habilidad.nombre), progress);
  }

  return {
    byId,
    byName,
  };
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
    source: 'local',
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
  const locale = filters.locale ?? 'es';
  const [userSkillContext, userInterestAreas] = await Promise.all([
    getUserSkillContext(usuarioId),
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

  const [vacantes, b2bVacantes] = await Promise.all([
    dbClient.vacantes.findMany({
      where,
      include: VACANTE_INCLUDE,
      orderBy: { fecha_publicacion: 'desc' },
    }),
    listB2BJobs(userSkillContext.byName, {
      locale,
      allowedAreas: new Set(allowedAreas),
    }),
  ]);

  const localVacantes = vacantes.map((vacante) =>
    mapVacante(vacante, userSkillContext.byId),
  );
  const normalizedSearch = search ? normalizeSkillName(search) : undefined;
  const filteredB2BVacantes = b2bVacantes.filter((vacante) => {
    if (
      filters.modalidad &&
      vacante.modalidad !== MODALIDAD_LABELS[filters.modalidad]
    ) {
      return false;
    }

    return normalizedSearch
      ? normalizeSkillName(
          `${vacante.titulo} ${vacante.empresa} ${vacante.descripcion ?? ''}`,
        ).includes(normalizedSearch)
      : true;
  });

  const recommendedLocalVacantes = localVacantes.filter((vacante) =>
    meetsRecommendedMatch(vacante.matchPorcentaje),
  );
  const recommendedB2BVacantes = filteredB2BVacantes.filter((vacante) =>
    meetsRecommendedMatch(vacante.matchPorcentaje),
  );

  const mapped = [
    ...recommendedLocalVacantes,
    ...recommendedB2BVacantes,
  ].sort((a, b) => {
    if (a.matchPorcentaje === null && b.matchPorcentaje !== null) return 1;
    if (a.matchPorcentaje !== null && b.matchPorcentaje === null) return -1;

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
  const [vacante, userSkillContext] = await Promise.all([
    dbClient.vacantes.findFirst({
      where: { vacante_id: vacanteId, activa: true },
      include: VACANTE_INCLUDE,
    }),
    getUserSkillContext(usuarioId),
  ]);

  return vacante ? mapVacante(vacante, userSkillContext.byId) : null;
}

export async function calculateVacanteMatch(
  usuarioId: string,
  vacanteId: string,
) {
  const [vacante, userSkillContext] = await Promise.all([
    dbClient.vacantes.findFirst({
      where: { vacante_id: vacanteId, activa: true },
      select: {
        vacante_id: true,
        requisitos: { select: { habilidad_id: true, prioridad: true } },
      },
    }),
    getUserSkillContext(usuarioId),
  ]);

  return vacante
    ? { match: calculateMatch(vacante.requisitos, userSkillContext.byId) }
    : null;
}
