import assert from 'node:assert/strict';
import test from 'node:test';
import {
  calculateLearningProgressBySkill,
  calculateSkillsMatch,
  skillStatusFromProgress,
} from './skill-progress';

test('calculates the profile match from proportional skill progress', () => {
  assert.equal(
    calculateSkillsMatch([
      { progreso_porcentaje: 100 },
      { progreso_porcentaje: 50 },
      { progreso_porcentaje: 0 },
    ]),
    50,
  );
  assert.equal(calculateSkillsMatch([]), 0);
});

test('uses lesson weights when calculating progress for each skill', () => {
  const progress = calculateLearningProgressBySkill({
    lessonMappings: [
      { lessonId: 'lesson-1', skillId: 'python', weight: 3 },
      { lessonId: 'lesson-2', skillId: 'python', weight: 1 },
      { lessonId: 'lesson-2', skillId: 'sql', weight: 2 },
    ],
    completedLessonIds: new Set(['lesson-1']),
  });

  assert.deepEqual(progress, [
    { skillId: 'python', progress: 75 },
    { skillId: 'sql', progress: 0 },
  ]);
});

test('maps progress boundaries to the persisted skill status', () => {
  assert.equal(skillStatusFromProgress(0), 'Faltante');
  assert.equal(skillStatusFromProgress(1), 'En_progreso');
  assert.equal(skillStatusFromProgress(99), 'En_progreso');
  assert.equal(skillStatusFromProgress(100), 'Adquirida');
});
