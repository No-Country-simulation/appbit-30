import { logApiError, getRequestId } from '@/src/server/api/api-error';

export interface CourseItem {
  id: string;
  title: string;
  habilidad_principal: string;
  activo: boolean;
  es_gratis: boolean;
  duracion_horas: number;
}

export interface Recommendation {
  courseId: string;
  title: string;
  reason: string;
}

function recomendarLocal(
  gapItems: string[],
  courseCatalog: CourseItem[],
): Recommendation[] {
  const lowerGaps = gapItems.map((g) => g.toLowerCase().trim());
  const matched = courseCatalog
    .filter(
      (c) =>
        c.activo &&
        lowerGaps.some(
          (g) =>
            c.habilidad_principal.toLowerCase().includes(g) ||
            g.includes(c.habilidad_principal.toLowerCase()),
        ),
    )
    .sort((a, b) => {
      if (a.es_gratis && !b.es_gratis) return -1;
      if (!a.es_gratis && b.es_gratis) return 1;
      return a.duracion_horas - b.duracion_horas;
    })
    .slice(0, 5)
    .map((c) => ({
      courseId: c.id,
      title: c.title,
      reason: c.es_gratis
        ? 'Curso gratuito que cubre esta habilidad'
        : 'Curso recomendado para esta área',
    }));

  return matched;
}

export async function recomendarCursosConAI(
  userId: string,
  gapItems: string[],
  courseCatalog: CourseItem[],
  currentSkills?: string[],
  targetJob?: string,
): Promise<Recommendation[]> {
  const fallbackResult = recomendarLocal(gapItems, courseCatalog);

  const aiServiceUrl = process.env.AI_SERVICE_URL;
  if (!aiServiceUrl) return fallbackResult;

  const requestId = getRequestId(new Request('http://localhost'));

  try {
    const aiResponse = await fetch(`${aiServiceUrl}/learning-path/recommend`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-request-id': requestId,
      },
      body: JSON.stringify({
        userId,
        currentSkills: currentSkills ?? [],
        targetJob: targetJob ?? '',
        gapItems,
        courseCatalog: courseCatalog.filter((c) => c.activo),
      }),
      signal: AbortSignal.timeout(20000),
    });

    if (!aiResponse.ok) {
      const text = await aiResponse.text().catch(() => '');
      console.warn(
        `AI service returned ${aiResponse.status} for learning-path, using fallback`,
      );
      return fallbackResult;
    }

    const data = await aiResponse.json();

    if (
      data &&
      Array.isArray(data.recommendations) &&
      data.recommendations.length > 0
    ) {
      return data.recommendations.slice(0, 5);
    }

    return fallbackResult;
  } catch (error) {
    logApiError({
      route: 'recomendarCursosConAI',
      requestId,
      error,
      context: {
        code: 'AI_LEARNING_PATH_FALLBACK',
        userId,
        gapCount: gapItems.length,
      },
    });
    return fallbackResult;
  }
}