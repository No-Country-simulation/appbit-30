import assert from 'node:assert/strict';
import test from 'node:test';
import {
  applyOptionalPlanCopy,
  buildDeterministicPlan,
} from './plan-action.js';

test('prioritizes the least developed skills and maps exact courses', () => {
  const plan = buildDeterministicPlan({
    skills: [
      { id: 'sql', name: 'SQL', progress: 60 },
      { id: 'python', name: 'Python', progress: 10 },
      { id: 'power-bi', name: 'Power BI', progress: 30 },
      { id: 'excel', name: 'Excel', progress: 100 },
    ],
    courses: [
      { id: 'course-sql', title: 'SQL básico', skillIds: ['sql'] },
      {
        id: 'course-python',
        title: 'Python básico',
        skillIds: ['python'],
      },
    ],
  });

  assert.deepEqual(
    plan.slice(0, 3).map((item) => ({
      skillId: item.skillId,
      courseId: item.courseId,
      priority: item.priority,
    })),
    [
      {
        skillId: 'python',
        courseId: 'course-python',
        priority: 'Alta_prioridad',
      },
      {
        skillId: 'power-bi',
        courseId: null,
        priority: 'Media_prioridad',
      },
      {
        skillId: 'sql',
        courseId: 'course-sql',
        priority: 'Media_prioridad',
      },
    ],
  );
});

test('uses stable general actions when no skill is pending', () => {
  const plan = buildDeterministicPlan({
    skills: [{ id: 'sql', name: 'SQL', progress: 100 }],
    courses: [],
    locale: 'pt',
  });

  assert.equal(plan.length, 3);
  assert.deepEqual(
    plan.map((item) => item.key),
    ['general:project', 'general:profile', 'general:jobs'],
  );
});

test('AI copy cannot change deterministic decisions', () => {
  const [item] = buildDeterministicPlan({
    skills: [{ id: 'sql', name: 'SQL', progress: 0 }],
    courses: [{ id: 'course-sql', title: 'SQL básico', skillIds: ['sql'] }],
    maxItems: 1,
  });

  assert.ok(item);

  const [result] = applyOptionalPlanCopy([item], [
    {
      key: item.key,
      titulo: 'Practicar SQL con datos',
      descripcion: 'Resolvé ejercicios aplicados con consultas SQL.',
      accion_label: 'Comenzar práctica',
      prioridad: 'Baja_prioridad',
      curso_id: 'inventado',
      skill_id: 'inventada',
      orden: 99,
    },
  ]);

  assert.equal(result?.title, 'Practicar SQL con datos');
  assert.equal(result?.courseId, 'course-sql');
  assert.equal(result?.skillId, 'sql');
  assert.equal(result?.priority, 'Alta_prioridad');
  assert.equal(result?.order, 1);
});

test('keeps deterministic copy when AI output is missing or invalid', () => {
  const plan = buildDeterministicPlan({
    skills: [{ id: 'sql', name: 'SQL', progress: 0 }],
    courses: [],
    maxItems: 1,
  });

  assert.deepEqual(
    applyOptionalPlanCopy(plan, [{ key: 'unknown', titulo: 'Otro' }]),
    plan,
  );
  assert.deepEqual(applyOptionalPlanCopy(plan, null), plan);
});
