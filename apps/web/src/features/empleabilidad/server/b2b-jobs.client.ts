import {
  MARKET_SKILLS_BY_AREA,
  isAreaInteresValue,
  type AreaInteresValue,
} from '@/src/features/onboarding/data/market-skills';
import { calculateSkillsMatch } from '@/src/server/progress/skill-progress';
import type {
  EmployabilityLocale,
  VacanteItem,
} from '../types';
import { createPendingMobility } from './mobility';

const B2B_REQUEST_TIMEOUT_MS = 5_000;

export interface B2BJob {
  id: string | number;
  title: string;
  company: string;
  location: string;
  modality: string;
  area: AreaInteresValue;
  skills: string[];
  destinationCluster?: string;
}

interface B2BJobFixture extends Omit<B2BJob, 'title'> {
  title: Record<EmployabilityLocale, string>;
}

interface ListB2BJobsOptions {
  locale?: EmployabilityLocale;
  allowedAreas?: ReadonlySet<AreaInteresValue>;
}

const B2B_COPY = {
  es: {
    unspecifiedLevel: 'No especificado',
    description:
      'Oportunidad compartida por la plataforma B2B para conectar talentos con empresas.',
    areaLabels: {
      Data_Analytics: 'Data & Analytics',
      Desarrollo_Web: 'Desarrollo Web',
      UX_UI_Design: 'UX / UI Design',
      Ciberseguridad: 'Ciberseguridad',
      Cloud_DevOps: 'Cloud & DevOps',
      Inteligencia_Artificial: 'Inteligencia Artificial',
      Marketing_Digital: 'Marketing Digital',
      Product_Management: 'Product Management',
    },
  },
  pt: {
    unspecifiedLevel: 'Não especificado',
    description:
      'Oportunidade compartilhada pela plataforma B2B para conectar talentos a empresas.',
    areaLabels: {
      Data_Analytics: 'Dados e Analytics',
      Desarrollo_Web: 'Desenvolvimento Web',
      UX_UI_Design: 'UX / UI Design',
      Ciberseguridad: 'Cibersegurança',
      Cloud_DevOps: 'Cloud e DevOps',
      Inteligencia_Artificial: 'Inteligência Artificial',
      Marketing_Digital: 'Marketing Digital',
      Product_Management: 'Gestão de Produto',
    },
  },
} as const satisfies Record<
  EmployabilityLocale,
  {
    unspecifiedLevel: string;
    description: string;
    areaLabels: Record<AreaInteresValue, string>;
  }
>;

function juniorSkillValues(
  area: AreaInteresValue,
  indexes: readonly number[] = [0, 1, 2],
) {
  const skills = MARKET_SKILLS_BY_AREA[area].hardSkills.Junior;

  return indexes.map((index) => skills[index]?.value).filter(Boolean) as string[];
}

export const MOCK_B2B_JOB_FIXTURES: readonly B2BJobFixture[] = [
  {
    id: 'web-junior',
    title: {
      es: 'Desarrollador Frontend Junior',
      pt: 'Desenvolvedor Front-end Júnior',
    },
    company: 'Tech Inclusiva',
    location: 'Florianópolis, SC',
    modality: 'Hybrid',
    area: 'Desarrollo_Web',
    skills: juniorSkillValues('Desarrollo_Web'),
    destinationCluster: 'CENTRO_HISTORICO',
  },
  {
    id: 'cyber-junior',
    title: {
      es: 'Analista de Ciberseguridad Junior',
      pt: 'Analista de Cibersegurança Júnior',
    },
    company: 'Secure Path',
    location: 'Remoto',
    modality: 'Remote',
    area: 'Ciberseguridad',
    skills: juniorSkillValues('Ciberseguridad'),
  },
  {
    id: 'marketing-junior',
    title: {
      es: 'Analista de Marketing Digital Junior',
      pt: 'Analista de Marketing Digital Júnior',
    },
    company: 'Impulso Digital',
    location: 'São José, SC',
    modality: 'Hybrid',
    area: 'Marketing_Digital',
    skills: juniorSkillValues('Marketing_Digital'),
    destinationCluster: 'SAO_JOSE_KOBRASOL',
  },
  {
    id: 'data-junior',
    title: {
      es: 'Analista de Datos Junior',
      pt: 'Analista de Dados Júnior',
    },
    company: 'Empresa Demo',
    location: 'Remoto',
    modality: 'Remote',
    area: 'Data_Analytics',
    skills: juniorSkillValues('Data_Analytics', [0, 2, 3]),
  },
  {
    id: 'ux-ui-junior',
    title: {
      es: 'Diseñador UX/UI Junior',
      pt: 'Designer UX/UI Júnior',
    },
    company: 'Diseño Abierto',
    location: 'Florianópolis, SC',
    modality: 'Hybrid',
    area: 'UX_UI_Design',
    skills: juniorSkillValues('UX_UI_Design'),
    destinationCluster: 'UFSC',
  },
  {
    id: 'ai-junior',
    title: {
      es: 'Especialista en IA Junior',
      pt: 'Especialista em IA Júnior',
    },
    company: 'AI para Todos',
    location: 'Remoto',
    modality: 'Remote',
    area: 'Inteligencia_Artificial',
    skills: juniorSkillValues('Inteligencia_Artificial'),
  },
  {
    id: 'product-junior',
    title: {
      es: 'Analista de Producto Junior',
      pt: 'Analista de Produto Júnior',
    },
    company: 'Producto Cercano',
    location: 'Palhoça, SC',
    modality: 'Hybrid',
    area: 'Product_Management',
    skills: juniorSkillValues('Product_Management'),
    destinationCluster: 'PALHOCA_PEDRA_BRANCA',
  },
  {
    id: 'cloud-devops-junior',
    title: {
      es: 'Analista Cloud y DevOps Junior',
      pt: 'Analista de Cloud e DevOps Júnior',
    },
    company: 'Nube Regional',
    location: 'Remoto',
    modality: 'Remote',
    area: 'Cloud_DevOps',
    skills: juniorSkillValues('Cloud_DevOps'),
  },
];

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function isB2BJob(value: unknown): value is B2BJob {
  if (!value || typeof value !== 'object') return false;

  const job = value as Record<string, unknown>;
  return (
    (typeof job.id === 'string' || typeof job.id === 'number') &&
    isNonEmptyString(job.title) &&
    isNonEmptyString(job.company) &&
    isNonEmptyString(job.location) &&
    isNonEmptyString(job.modality) &&
    typeof job.area === 'string' &&
    isAreaInteresValue(job.area) &&
    (job.destinationCluster === undefined ||
      isNonEmptyString(job.destinationCluster)) &&
    Array.isArray(job.skills) &&
    job.skills.length > 0 &&
    job.skills.every(isNonEmptyString)
  );
}

export function parseB2BJobs(payload: unknown): B2BJob[] {
  if (!Array.isArray(payload) || !payload.every(isB2BJob)) {
    throw new Error('Invalid B2B jobs response');
  }

  return payload;
}

export function normalizeSkillName(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .replace(/\s+/g, ' ')
    .toLocaleLowerCase();
}

function modalityLabel(
  modality: string,
  locale: EmployabilityLocale,
) {
  const normalized = normalizeSkillName(modality);
  if (normalized === 'remote' || normalized === 'remoto') return '100% Remoto';
  if (normalized === 'hybrid' || normalized === 'hibrido') return 'Híbrido';
  if (normalized === 'onsite' || normalized === 'presencial') {
    return 'Presencial';
  }

  return locale === 'pt' && normalized === 'nao especificado'
    ? 'Não especificado'
    : modality.trim();
}

export function getMockB2BJobs(
  locale: EmployabilityLocale = 'es',
): B2BJob[] {
  return MOCK_B2B_JOB_FIXTURES.map((job) => ({
    ...job,
    title: job.title[locale],
    skills: [...job.skills],
  }));
}

export function mapB2BJob(
  job: B2BJob,
  userSkillProgress: ReadonlyMap<string, number>,
  locale: EmployabilityLocale = 'es',
): VacanteItem {
  const normalizedModality = normalizeSkillName(job.modality);
  const isRemote =
    normalizedModality === 'remote' || normalizedModality === 'remoto';
  const skills = job.skills.map((skill) => {
    const progresoPorcentaje = Math.max(
      0,
      Math.min(
        100,
        Math.round(
          userSkillProgress.get(normalizeSkillName(skill)) ?? 0,
        ),
      ),
    );

    return {
      nombre: skill.trim(),
      laTienes: progresoPorcentaje === 100,
      progresoPorcentaje,
    };
  });
  const copy = B2B_COPY[locale];

  return {
    id: `b2b:${job.id}`,
    source: 'b2b',
    titulo: job.title.trim(),
    empresa: job.company.trim(),
    empresaDescripcion: null,
    logoUrl: null,
    area: copy.areaLabels[job.area],
    nivel: copy.unspecifiedLevel,
    modalidad: modalityLabel(job.modality, locale),
    modalidadDetallada: null,
    ubicacion: job.location.trim(),
    distancia: null,
    movilidad: createPendingMobility({
      isRemote,
      destinationCluster: job.destinationCluster,
    }),
    matchPorcentaje: calculateSkillsMatch(
      skills.map((skill) => ({
        progreso_porcentaje: skill.progresoPorcentaje,
      })),
    ),
    fechaPublicacion: '',
    descripcion: copy.description,
    educacionRequerida: [],
    experienciaSolicitada: [],
    idioma: [],
    jornada: [],
    skills,
  };
}

function filterByAllowedAreas(
  jobs: B2BJob[],
  allowedAreas?: ReadonlySet<AreaInteresValue>,
) {
  if (!allowedAreas) return jobs;
  return jobs.filter((job) => allowedAreas.has(job.area));
}

export async function listB2BJobs(
  userSkillProgress: ReadonlyMap<string, number>,
  options: ListB2BJobsOptions = {},
): Promise<VacanteItem[]> {
  const locale = options.locale ?? 'es';
  const endpoint = process.env.B2B_JOBS_API_URL?.trim();

  if (!endpoint) {
    return filterByAllowedAreas(
      getMockB2BJobs(locale),
      options.allowedAreas,
    ).map((job) => mapB2BJob(job, userSkillProgress, locale));
  }

  try {
    const response = await fetch(endpoint, {
      method: 'GET',
      headers: { Accept: 'application/json' },
      cache: 'no-store',
      signal: AbortSignal.timeout(B2B_REQUEST_TIMEOUT_MS),
    });

    if (!response.ok) {
      throw new Error(`B2B jobs API responded with ${response.status}`);
    }

    const jobs = filterByAllowedAreas(
      parseB2BJobs(await response.json()),
      options.allowedAreas,
    );
    return jobs.map((job) => mapB2BJob(job, userSkillProgress, locale));
  } catch (error) {
    console.error('Error fetching B2B vacancies:', error);
    return [];
  }
}
