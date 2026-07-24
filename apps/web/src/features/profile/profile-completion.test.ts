import assert from 'node:assert/strict';
import test from 'node:test';
import { buildProfileCompletion } from './profile-completion';

test('assigns 60 percent to a completed onboarding', () => {
  assert.equal(
    buildProfileCompletion({ onboarding_status: 'COMPLETED' }).profilePercent,
    60,
  );
});

test('assigns 80 percent when onboarding and avatar are complete', () => {
  assert.equal(
    buildProfileCompletion({
      onboarding_status: 'COMPLETED',
      avatar_url: '/demo-avatar.svg',
    }).profilePercent,
    80,
  );
});

test('requires both country and city for the location points', () => {
  assert.equal(
    buildProfileCompletion({
      onboarding_status: 'COMPLETED',
      pais: 'Argentina',
    }).profilePercent,
    60,
  );
});

test('assigns 100 percent to the complete demo profile', () => {
  const completion = buildProfileCompletion({
    onboarding_status: 'COMPLETED',
    avatar_url: '/demo-avatar.svg',
    pais: 'Argentina',
    ciudad: 'Buenos Aires',
  });

  assert.equal(completion.profilePercent, 100);
  assert.deepEqual(completion.perfilBreakdown, {
    onboarding: true,
    avatar: true,
    ubicacion: true,
  });
});
