import { dbClient } from '@/src/server/clients/db.client';
import type {
  AreaInteresEnum,
  ModalidadVacanteEnum,
  Prisma,
} from '@/src/server/generated/prisma';
import type { VacanteItem } from '../types';
import {
  listB2BJobs,
  normalizeSkillName,
} from './b2b-jobs.client';

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
  userSkillIds: ReadonlySet<string>,
) {
  if (requisitos.length === 0) return null;

  const priorityWeight = (priority: number) => {
    if (priority === 1) return 3;
    if (priority === 2) return 2;
    return 1;
  };

  const totalWeight = requisitos.reduce(
    (total, item) => total + priorityWeight(item.prioridad),
    0,
  );
  const matchedWeight = requisitos.reduce(
    (total, item) =>
      userSkillIds.has(item.habilidad_id)
        ? total + priorityWeight(item.prioridad)
        : total,
    0,
  );

  return Math.round((matchedWeight / totalWeight) * 100);
}

async function getUserSkills(usuarioId: string) {
  const skills = await dbClient.usuarioHabilidades.findMany({
    where: {
      usuario_id: usuarioId,
      estado: { in: ['Adquirida', 'En_progreso'] },
    },
    select: {
      habilidad_id: true,
      habilidad: { select: { nombre: true } },
    },
  });

  return {
    ids: new Set(skills.map((item) => item.habilidad_id)),
    names: new Set(
      skills.map((item) => normalizeSkillName(item.habilidad.nombre)),
    ),
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
  userSkillIds: ReadonlySet<string>,
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
    matchPorcentaje: calculateMatch(vacante.requisitos, userSkillIds),
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
    skills: vacante.requisitos.map((item) => ({
      nombre: item.habilidad.nombre,
      laTienes: userSkillIds.has(item.habilidad_id),
    })),
  };
}

export async function listVacantes(
  usuarioId: string,
  filters: VacanteFilters,
) {
  const search = filters.search?.trim();
  const [userSkills, userInterestAreas] = await Promise.all([
    getUserSkills(usuarioId),
    getUserInterestAreas(usuarioId),
  ]);
  const userSkillIds = userSkills.ids;
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
    listB2BJobs(userSkills.names),
  ]);

  const localVacantes = vacantes.map((vacante) =>
    mapVacante(vacante, userSkillIds),
  );
  const normalizedSearch = search?.toLocaleLowerCase();
  const filteredB2BVacantes = b2bVacantes.filter((vacante) => {
    if (
      filters.modalidad &&
      vacante.modalidad !== MODALIDAD_LABELS[filters.modalidad]
    ) {
      return false;
    }

    return normalizedSearch
      ? `${vacante.titulo} ${vacante.empresa} ${vacante.descripcion ?? ''}`
          .toLocaleLowerCase()
          .includes(normalizedSearch)
      : true;
  });

  const recommendedLocalVacantes = localVacantes.filter(
    (vacante) =>
      vacante.matchPorcentaje !== null && vacante.matchPorcentaje >= 50,
  );
  const mapped = [...recommendedLocalVacantes, ...filteredB2BVacantes]
    .sort((a, b) => {
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
  const [vacante, userSkillIds] = await Promise.all([
    dbClient.vacantes.findFirst({
      where: { vacante_id: vacanteId, activa: true },
      include: VACANTE_INCLUDE,
    }),
    getUserSkills(usuarioId).then((skills) => skills.ids),
  ]);

  return vacante ? mapVacante(vacante, userSkillIds) : null;
}

export async function calculateVacanteMatch(
  usuarioId: string,
  vacanteId: string,
) {
  const [vacante, userSkillIds] = await Promise.all([
    dbClient.vacantes.findFirst({
      where: { vacante_id: vacanteId, activa: true },
      select: {
        vacante_id: true,
        requisitos: { select: { habilidad_id: true, prioridad: true } },
      },
    }),
    getUserSkills(usuarioId).then((skills) => skills.ids),
  ]);

  return vacante
    ? calculateMatch(vacante.requisitos, userSkillIds)
    : null;
}
