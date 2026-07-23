import assert from 'node:assert/strict';
import test from 'node:test';
import {
  mapB2BJob,
  listB2BJobs,
  normalizeSkillName,
  parseB2BJobs,
} from './b2b-jobs.client';

const validJob = {
  id: 1,
  title: 'Analista de Datos',
  company: 'Empresa Demo',
  location: 'Remoto',
  modality: 'Remote',
  skills: ['Python', 'SQL', 'Power BI'],
};

test('normalizes casing, accents and surrounding spaces', () => {
  assert.equal(normalizeSkillName('  Análisis DE Datos  '), 'analisis de datos');
});

test('calculates the B2B match using normalized skill names', () => {
  const vacancy = mapB2BJob(
    validJob,
    new Set(['python', 'sql', 'postgresql']),
  );

  assert.equal(vacancy.source, 'b2b');
  assert.equal(vacancy.id, 'b2b:1');
  assert.equal(vacancy.matchPorcentaje, 67);
  assert.deepEqual(
    vacancy.skills.map((skill) => skill.laTienes),
    [true, true, false],
  );
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
  t.mock.method(globalThis, 'fetch', async () => new Response(null, { status: 503 }));
  t.mock.method(console, 'error', () => undefined);

  try {
    assert.deepEqual(await listB2BJobs(new Set(['sql'])), []);
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
    assert.deepEqual(await listB2BJobs(new Set(['sql'])), []);
  } finally {
    if (previousEndpoint === undefined) {
      delete process.env.B2B_JOBS_API_URL;
    } else {
      process.env.B2B_JOBS_API_URL = previousEndpoint;
    }
  }
});
