import assert from 'node:assert/strict';
import test from 'node:test';
import { MARKET_SKILLS_BY_AREA } from '@/src/features/onboarding/data/market-skills';
import {
  getMockB2BJobs,
  listB2BJobs,
  mapB2BJob,
  normalizeSkillName,
  parseB2BJobs,
} from './b2b-jobs.client';

const validJob = {
  id: 1,
  title: 'Analista de Datos',
  company: 'Empresa Demo',
  location: 'Remoto',
  modality: 'Remote',
  area: 'Data_Analytics' as const,
  skills: ['SQL Data', 'Python básico Pandas', 'Tableau/Power BI'],
};

test('normalizes casing, accents and repeated spaces', () => {
  assert.equal(
    normalizeSkillName('  Análisis   DE Datos  '),
    'analisis de datos',
  );
});

test('calculates B2B match from the current progress of each skill', () => {
  const vacancy = mapB2BJob(
    validJob,
    new Map([
      ['sql data', 100],
      ['python basico pandas', 100],
      ['tableau/power bi', 0],
    ]),
  );

  assert.equal(vacancy.source, 'b2b');
  assert.equal(vacancy.id, 'b2b:1');
  assert.equal(vacancy.matchPorcentaje, 67);
  assert.deepEqual(
    vacancy.skills.map((skill) => skill.progresoPorcentaje),
    [100, 100, 0],
  );
  assert.deepEqual(
    vacancy.skills.map((skill) => skill.laTienes),
    [true, true, false],
  );
});

test('includes partial progress in the B2B match', () => {
  const vacancy = mapB2BJob(
    validJob,
    new Map([
      ['sql data', 100],
      ['python basico pandas', 50],
    ]),
  );

  assert.equal(vacancy.matchPorcentaje, 50);
  assert.equal(vacancy.skills[1]?.laTienes, false);
});

test('localizes controlled B2B copy without changing canonical skills', () => {
  const vacancy = mapB2BJob(validJob, new Map(), 'pt');

  assert.equal(vacancy.nivel, 'Não especificado');
  assert.equal(vacancy.area, 'Dados e Analytics');
  assert.match(vacancy.descripcion ?? '', /Oportunidade compartilhada/);
  assert.deepEqual(
    vacancy.skills.map((skill) => skill.nombre),
    validJob.skills,
  );
});

test('provides one canonical mock vacancy for every AppBiT area', () => {
  const jobs = getMockB2BJobs('es');
  const expectedAreas = Object.keys(MARKET_SKILLS_BY_AREA).sort();

  assert.equal(jobs.length, expectedAreas.length);
  assert.deepEqual(
    jobs.map((job) => job.area).sort(),
    expectedAreas,
  );

  for (const job of jobs) {
    const canonicalSkills = new Set(
      Object.values(MARKET_SKILLS_BY_AREA[job.area].hardSkills)
        .flat()
        .map((skill) => skill.value),
    );

    assert.ok(job.skills.every((skill) => canonicalSkills.has(skill)));
  }
});

test('filters mock vacancies by the user interest areas', async () => {
  const previousEndpoint = process.env.B2B_JOBS_API_URL;
  delete process.env.B2B_JOBS_API_URL;

  try {
    const jobs = await listB2BJobs(new Map(), {
      allowedAreas: new Set(['Data_Analytics']),
    });

    assert.equal(jobs.length, 1);
    assert.equal(jobs[0]?.id, 'b2b:data-junior');
  } finally {
    if (previousEndpoint !== undefined) {
      process.env.B2B_JOBS_API_URL = previousEndpoint;
    }
  }
});

test('accepts an empty B2B response', () => {
  assert.deepEqual(parseB2BJobs([]), []);
});

test('rejects an invalid B2B response', () => {
  assert.throws(
    () => parseB2BJobs([{ ...validJob, skills: 'SQL' }]),
    /Invalid B2B jobs response/,
  );
});

test('keeps the local flow available when the B2B API returns an error', async (t) => {
  const previousEndpoint = process.env.B2B_JOBS_API_URL;
  process.env.B2B_JOBS_API_URL = 'https://b2b.example.test/api/jobs';
  t.mock.method(
    globalThis,
    'fetch',
    async () => new Response(null, { status: 503 }),
  );
  t.mock.method(console, 'error', () => undefined);

  try {
    assert.deepEqual(await listB2BJobs(new Map([['sql', 100]])), []);
  } finally {
    if (previousEndpoint === undefined) {
      delete process.env.B2B_JOBS_API_URL;
    } else {
      process.env.B2B_JOBS_API_URL = previousEndpoint;
    }
  }
});

test('handles a failed or aborted B2B request without throwing', async (t) => {
  const previousEndpoint = process.env.B2B_JOBS_API_URL;
  process.env.B2B_JOBS_API_URL = 'https://b2b.example.test/api/jobs';
  t.mock.method(globalThis, 'fetch', async () => {
    throw new DOMException('The operation was aborted', 'AbortError');
  });
  t.mock.method(console, 'error', () => undefined);

  try {
    assert.deepEqual(await listB2BJobs(new Map([['sql', 100]])), []);
  } finally {
    if (previousEndpoint === undefined) {
      delete process.env.B2B_JOBS_API_URL;
    } else {
      process.env.B2B_JOBS_API_URL = previousEndpoint;
    }
  }
});
