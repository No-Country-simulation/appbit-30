import { logApiError, getRequestId } from '@/src/server/api/api-error';

function calcularMatchLocal(
  requisitos: { habilidad_id: string }[],
  userSkills: { habilidad_id: string }[],
): number {
  if (requisitos.length === 0) return 0;
  const userSkillIds = new Set(userSkills.map((s) => s.habilidad_id));
  const matches = requisitos.filter((r) => userSkillIds.has(r.habilidad_id)).length;
  return Math.round((matches / requisitos.length) * 100);
}

export async function calcularMatchConAI(
  requisitos: { habilidad_id: string; habilidad: { nombre: string } }[],
  userSkills: { habilidad_id: string }[],
  userId: string,
  vacanteId: string,
  vacanteTitulo?: string,
  educacionRequerida?: string | null,
  idiomasRequeridos?: string[] | null,
  distanciaZona?: string | null,
): Promise<number> {
  const fallbackScore = calcularMatchLocal(requisitos, userSkills);

  const aiServiceUrl = process.env.AI_SERVICE_URL;
  if (!aiServiceUrl) return fallbackScore;

  const requestId = getRequestId(new Request('http://localhost'));

  try {
    const userSkillSet = new Set(userSkills.map((s) => s.habilidad_id));
    const userSkillNames = requisitos
      .filter((r) => userSkillSet.has(r.habilidad_id))
      .map((r) => r.habilidad.nombre);

    const requiredSkillNames = requisitos.map((r) => r.habilidad.nombre);

    const commuteScore = distanciaZona
      ? Math.round(Math.max(0, 100 - parseInt(distanciaZona, 10) * 10))
      : 50;

    const aiResponse = await fetch(`${aiServiceUrl}/job-match/calculate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-request-id': requestId,
      },
      body: JSON.stringify({
        userId,
        userProfile: {
          skills: userSkillNames,
          education: educacionRequerida ?? 'Sin especificar',
          englishLevel: Array.isArray(idiomasRequeridos) ? idiomasRequeridos.join(', ') : 'Sin especificar',
        },
        jobVacancy: {
          id: vacanteId,
          title: vacanteTitulo ?? 'Vacante',
          requiredSkills: requiredSkillNames,
          requiredEducation: educacionRequerida ?? 'Sin especificar',
          requiredEnglishLevel: Array.isArray(idiomasRequeridos) ? idiomasRequeridos.join(', ') : 'Sin especificar',
        },
        commuteScore,
      }),
      signal: AbortSignal.timeout(20000),
    });

    if (!aiResponse.ok) {
      const text = await aiResponse.text().catch(() => '');
      console.warn(`AI service returned ${aiResponse.status} for job-match, using fallback`);
      return fallbackScore;
    }

    const data = await aiResponse.json();
    return typeof data.matchScore === 'number' ? Math.round(data.matchScore) : fallbackScore;
  } catch (error) {
    logApiError({
      route: 'calcularMatchConAI',
      requestId,
      error,
      context: {
        code: 'AI_MATCH_FALLBACK',
        vacanteId,
        userId,
      },
    });
    return fallbackScore;
  }
}