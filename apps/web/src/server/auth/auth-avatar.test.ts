import assert from 'node:assert/strict';
import test from 'node:test';
import {
  getAuthAvatarUrl,
  resolveStoredAvatarUrl,
} from './auth-avatar';

const GOOGLE_AVATAR =
  'https://lh3.googleusercontent.com/a/example=s96-c';

test('reads the Google avatar from auth metadata', () => {
  assert.equal(
    getAuthAvatarUrl({
      user_metadata: { avatar_url: GOOGLE_AVATAR },
    }),
    GOOGLE_AVATAR,
  );
});

test('uses picture as a fallback metadata field', () => {
  assert.equal(
    getAuthAvatarUrl({
      user_metadata: { picture: GOOGLE_AVATAR },
    }),
    GOOGLE_AVATAR,
  );
});

test('reads the avatar from a linked Google identity', () => {
  assert.equal(
    getAuthAvatarUrl({
      user_metadata: {},
      identities: [
        {
          provider: 'google',
          identity_data: { avatar_url: GOOGLE_AVATAR },
        },
      ],
    }),
    GOOGLE_AVATAR,
  );
});

test('replaces legacy demo avatars with the authenticated avatar', () => {
  assert.equal(
    resolveStoredAvatarUrl({
      storedAvatarUrl: '/demo-avatar.svg',
      authAvatarUrl: GOOGLE_AVATAR,
    }),
    GOOGLE_AVATAR,
  );
});

test('preserves a custom stored avatar', () => {
  const customAvatar = 'https://cdn.example.com/custom-avatar.png';

  assert.equal(
    resolveStoredAvatarUrl({
      storedAvatarUrl: customAvatar,
      authAvatarUrl: GOOGLE_AVATAR,
    }),
    customAvatar,
  );
});

test('keeps the stored avatar when auth has no valid image URL', () => {
  assert.equal(
    resolveStoredAvatarUrl({
      storedAvatarUrl: '/local-avatar.svg',
      authAvatarUrl: null,
    }),
    '/local-avatar.svg',
  );
});
