import assert from 'node:assert/strict';
import test from 'node:test';
import {
  isB2BVacancyId,
  meetsRecommendedMatch,
} from './match-policy';

test('excludes vacancies below the recommended match threshold', () => {
  assert.equal(meetsRecommendedMatch(null), false);
  assert.equal(meetsRecommendedMatch(0), false);
  assert.equal(meetsRecommendedMatch(49), false);
});

test('includes vacancies at or above the recommended match threshold', () => {
  assert.equal(meetsRecommendedMatch(50), true);
  assert.equal(meetsRecommendedMatch(100), true);
});

test('identifies B2B vacancy ids so applications can reject them', () => {
  assert.equal(isB2BVacancyId('b2b:data-junior'), true);
  assert.equal(
    isB2BVacancyId('003f7b4f-364b-4fa0-b921-2452393769d6'),
    false,
  );
  assert.equal(isB2BVacancyId(null), false);
});
