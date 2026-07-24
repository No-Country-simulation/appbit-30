export type PlanPriority =
  | 'Alta_prioridad'
  | 'Media_prioridad'
  | 'Baja_prioridad';

export interface PlanSkill {
  id: string;
  name: string;
  progress: number;
}

export interface PlanCourse {
  id: string;
  title: string;
  skillIds: string[];
}

export interface DeterministicPlanItem {
  key: string;
  title: string;
  description: string;
  actionLabel: string;
  priority: PlanPriority;
  skillId: string | null;
  courseId: string | null;
  order: number;
}

interface PlanCopyItem {
  key: string;
  title: string;
  description: string;
  actionLabel: string;
}

function cleanText(value: unknown, maxLength: number) {
  if (typeof value !== 'string') return null;

  const cleaned = value.trim().replace(/\s+/g, ' ');
  if (!cleaned) return null;

  return cleaned.length <= maxLength
    ? cleaned
    : cleaned.slice(0, maxLength).trimEnd();
}

function priorityFor(index: number): PlanPriority {
  if (index === 0) return 'Alta_prioridad';
  if (index < 3) return 'Media_prioridad';
  return 'Baja_prioridad';
}

function skillPlanCopy(skillName: string, hasCourse: boolean, locale: string) {
  if (locale === 'pt') {
    return {
      title: `Fortalecer ${skillName}`,
      description: hasCourse
        ? `Avance com um curso focado em ${skillName}.`
        : `Pratique ${skillName} com uma atividade aplicada.`,
      actionLabel: hasCourse ? 'Começar curso' : 'Ver recomendação',
    };
  }

  return {
    title: `Fortalecer ${skillName}`,
    description: hasCourse
      ? `Avanzá con un curso enfocado en ${skillName}.`
      : `Practicá ${skillName} con una actividad aplicada.`,
    actionLabel: hasCourse ? 'Empezar curso' : 'Ver recomendación',
  };
}

function generalPlanItems(locale: string): Omit<
  DeterministicPlanItem,
  'order'
>[] {
  if (locale === 'pt') {
    return [
      {
        key: 'general:project',
        title: 'Aplicar habilidades em um projeto',
        description: 'Crie uma atividade simples para consolidar o aprendizado.',
        actionLabel: 'Planejar projeto',
        priority: 'Media_prioridad',
        skillId: null,
        courseId: null,
      },
      {
        key: 'general:profile',
        title: 'Atualizar o perfil profissional',
        description: 'Registre as novas habilidades concluídas no seu perfil.',
        actionLabel: 'Atualizar perfil',
        priority: 'Baja_prioridad',
        skillId: null,
        courseId: null,
      },
      {
        key: 'general:jobs',
        title: 'Explorar oportunidades compatíveis',
        description: 'Revise as vagas alinhadas ao seu perfil atual.',
        actionLabel: 'Ver oportunidades',
        priority: 'Baja_prioridad',
        skillId: null,
        courseId: null,
      },
    ];
  }

  return [
    {
      key: 'general:project',
      title: 'Aplicar habilidades en un proyecto',
      description: 'Creá una actividad simple para consolidar lo aprendido.',
      actionLabel: 'Planear proyecto',
      priority: 'Media_prioridad',
      skillId: null,
      courseId: null,
    },
    {
      key: 'general:profile',
      title: 'Actualizar el perfil profesional',
      description: 'Registrá las nuevas habilidades completadas en tu perfil.',
      actionLabel: 'Actualizar perfil',
      priority: 'Baja_prioridad',
      skillId: null,
      courseId: null,
    },
    {
      key: 'general:jobs',
      title: 'Explorar oportunidades compatibles',
      description: 'Revisá las vacantes alineadas con tu perfil actual.',
      actionLabel: 'Ver oportunidades',
      priority: 'Baja_prioridad',
      skillId: null,
      courseId: null,
    },
  ];
}

export function buildDeterministicPlan(params: {
  skills: PlanSkill[];
  courses: PlanCourse[];
  locale?: string;
  maxItems?: number;
}): DeterministicPlanItem[] {
  const locale = params.locale === 'pt' ? 'pt' : 'es';
  const maxItems = Math.max(1, Math.min(5, params.maxItems ?? 4));
  const pendingSkills = params.skills
    .filter((skill) => skill.progress < 100)
    .sort(
      (left, right) =>
        left.progress - right.progress || left.name.localeCompare(right.name),
    )
    .slice(0, maxItems);

  const skillItems: DeterministicPlanItem[] = pendingSkills.map(
    (skill, index) => {
      const course = params.courses.find((candidate) =>
        candidate.skillIds.includes(skill.id),
      );
      const copy = skillPlanCopy(skill.name, Boolean(course), locale);

      return {
        key: `skill:${skill.id}`,
        ...copy,
        priority: priorityFor(index),
        skillId: skill.id,
        courseId: course?.id ?? null,
        order: index + 1,
      };
    },
  );

  const missingCount = Math.max(0, Math.min(3, maxItems) - skillItems.length);
  const fillers = generalPlanItems(locale)
    .slice(0, missingCount)
    .map((item, index) => ({
      ...item,
      order: skillItems.length + index + 1,
    }));

  return [...skillItems, ...fillers];
}

export function applyOptionalPlanCopy(
  plan: DeterministicPlanItem[],
  rawCopy: unknown,
): DeterministicPlanItem[] {
  if (!Array.isArray(rawCopy)) return plan;

  const knownKeys = new Set(plan.map((item) => item.key));
  const copyByKey = new Map<string, PlanCopyItem>();

  for (const rawItem of rawCopy) {
    if (!rawItem || typeof rawItem !== 'object') continue;

    const candidate = rawItem as Record<string, unknown>;
    const key = cleanText(candidate.key, 100);
    const title = cleanText(candidate.titulo, 255);
    const description = cleanText(candidate.descripcion, 500);
    const actionLabel = cleanText(candidate.accion_label, 100);

    if (
      !key ||
      !knownKeys.has(key) ||
      !title ||
      !description ||
      !actionLabel ||
      copyByKey.has(key)
    ) {
      continue;
    }

    copyByKey.set(key, { key, title, description, actionLabel });
  }

  return plan.map((item) => {
    const copy = copyByKey.get(item.key);
    if (!copy) return item;

    return {
      ...item,
      title: copy.title,
      description: copy.description,
      actionLabel: copy.actionLabel,
    };
  });
}
