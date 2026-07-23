import type { VacanteItem } from '../types';

const B2B_REQUEST_TIMEOUT_MS = 5_000;

export interface B2BJob {
  id: string | number;
  title: string;
  company: string;
  location: string;
  modality: string;
  skills: string[];
}

const MOCK_B2B_JOBS: B2BJob[] = [
  {
    id: 1,
    title: 'Analista de Datos Junior',
    company: 'Empresa Demo',
    location: 'Remoto',
    modality: 'Remote',
    skills: ['Python', 'SQL', 'Power BI'],
  },
  {
    id: 2,
    title: 'Desarrollador Backend Junior',
    company: 'Tech Inclusiva',
    location: 'Buenos Aires',
    modality: 'Hybrid',
    skills: ['Node.js', 'PostgreSQL', 'REST API'],
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
    Array.isArray(job.skills) &&
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
    .toLocaleLowerCase();
}

function modalityLabel(modality: string) {
  const normalized = normalizeSkillName(modality);
  if (normalized === 'remote' || normalized === 'remoto') return '100% Remoto';
  if (normalized === 'hybrid' || normalized === 'hibrido') return 'Híbrido';
  if (normalized === 'onsite' || normalized === 'presencial') {
    return 'Presencial';
  }
  return modality.trim();
}

export function mapB2BJob(
  job: B2BJob,
  userSkillNames: ReadonlySet<string>,
): VacanteItem {
  const skills = job.skills.map((skill) => ({
    nombre: skill.trim(),
    laTienes: userSkillNames.has(normalizeSkillName(skill)),
  }));
  const matchedSkills = skills.filter((skill) => skill.laTienes).length;

  return {
    id: `b2b:${job.id}`,
    source: 'b2b',
    titulo: job.title.trim(),
    empresa: job.company.trim(),
    empresaDescripcion: null,
    logoUrl: null,
    area: 'B2B',
    nivel: 'No especificado',
    modalidad: modalityLabel(job.modality),
    modalidadDetallada: null,
    ubicacion: job.location.trim(),
    distancia: null,
    matchPorcentaje:
      skills.length > 0
        ? Math.round((matchedSkills / skills.length) * 100)
        : null,
    fechaPublicacion: '',
    descripcion:
      'Oportunidad compartida por la plataforma B2B para conectar talentos con empresas.',
    educacionRequerida: [],
    experienciaSolicitada: [],
    idioma: [],
    jornada: [],
    skills,
  };
}

export async function listB2BJobs(
  userSkillNames: ReadonlySet<string>,
): Promise<VacanteItem[]> {
  const endpoint = process.env.B2B_JOBS_API_URL?.trim();

  if (!endpoint) {
    return MOCK_B2B_JOBS.map((job) => mapB2BJob(job, userSkillNames));
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

    const jobs = parseB2BJobs(await response.json());
    return jobs.map((job) => mapB2BJob(job, userSkillNames));
  } catch (error) {
    console.error('Error fetching B2B vacancies:', error);
    return [];
  }
}
