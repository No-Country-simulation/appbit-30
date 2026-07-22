import type { Prisma } from '@/src/server/generated/prisma';

export function clampPercent(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

export function calculateSkillsMatch(
  skills: ReadonlyArray<{ progreso_porcentaje: number }>,
) {
  if (skills.length === 0) {
    return 0;
  }

  const accumulated = skills.reduce(
    (total, skill) => total + clampPercent(skill.progreso_porcentaje),
    0,
  );

  return clampPercent(accumulated / skills.length);
}

export function calculateWeightedVacancyMatch(
  requirements: ReadonlyArray<{ skillId: string; priority: number }>,
  skillProgress: ReadonlyMap<string, number>,
) {
  if (requirements.length === 0) return null;

  const priorityWeight = (priority: number) => {
    if (priority === 1) return 3;
    if (priority === 2) return 2;
    return 1;
  };
  const totalWeight = requirements.reduce(
    (total, requirement) => total + priorityWeight(requirement.priority),
    0,
  );
  const completedWeight = requirements.reduce((total, requirement) => {
    const progress = clampPercent(skillProgress.get(requirement.skillId) ?? 0);

    return total + priorityWeight(requirement.priority) * (progress / 100);
  }, 0);

  return clampPercent((completedWeight / totalWeight) * 100);
}

export function calculateLearningProgressBySkill(params: {
  lessonMappings: ReadonlyArray<{
    lessonId: string;
    skillId: string;
    weight: number;
  }>;
  completedLessonIds: ReadonlySet<string>;
}) {
  const totals = new Map<string, { total: number; completed: number }>();

  for (const mapping of params.lessonMappings) {
    const weight = Math.max(1, mapping.weight);
    const current = totals.get(mapping.skillId) ?? { total: 0, completed: 0 };

    current.total += weight;
    if (params.completedLessonIds.has(mapping.lessonId)) {
      current.completed += weight;
    }

    totals.set(mapping.skillId, current);
  }

  return Array.from(totals, ([skillId, value]) => ({
    skillId,
    progress: clampPercent((value.completed / value.total) * 100),
  }));
}

export async function getUserSkillsMatch(
  client: Pick<Prisma.TransactionClient, 'usuarioHabilidades'>,
  usuarioId: string,
) {
  const skills = await client.usuarioHabilidades.findMany({
    where: { usuario_id: usuarioId },
    select: { progreso_porcentaje: true },
  });

  return calculateSkillsMatch(skills);
}

export function skillStatusFromProgress(progress: number) {
  const normalized = clampPercent(progress);

  if (normalized === 0) return 'Faltante' as const;
  if (normalized === 100) return 'Adquirida' as const;

  return 'En_progreso' as const;
}
