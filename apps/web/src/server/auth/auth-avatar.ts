type AuthUserWithMetadata = {
  user_metadata?: Record<string, unknown>;
  identities?: Array<{
    provider?: string;
    identity_data?: Record<string, unknown>;
  }> | null;
};

const LEGACY_DEMO_AVATAR_URLS = new Set([
  '/demo-avatar.svg',
  '/demo avatar.svg',
]);

function getHttpUrl(value: unknown) {
  if (typeof value !== 'string' || !value.trim()) {
    return null;
  }

  try {
    const url = new URL(value.trim());

    return url.protocol === 'https:' || url.protocol === 'http:'
      ? url.toString()
      : null;
  } catch {
    return null;
  }
}

export function getAuthAvatarUrl(authUser: AuthUserWithMetadata) {
  const metadata = authUser.user_metadata ?? {};
  const metadataAvatar =
    getHttpUrl(metadata.avatar_url) ?? getHttpUrl(metadata.picture);

  if (metadataAvatar) {
    return metadataAvatar;
  }

  for (const identity of authUser.identities ?? []) {
    const identityData = identity.identity_data ?? {};
    const identityAvatar =
      getHttpUrl(identityData.avatar_url) ??
      getHttpUrl(identityData.picture);

    if (identityAvatar) {
      return identityAvatar;
    }
  }

  return null;
}

export function resolveStoredAvatarUrl(params: {
  storedAvatarUrl?: string | null;
  authAvatarUrl?: string | null;
}) {
  const storedAvatarUrl = params.storedAvatarUrl?.trim() || null;
  const authAvatarUrl = params.authAvatarUrl?.trim() || null;

  if (
    authAvatarUrl &&
    (!storedAvatarUrl || LEGACY_DEMO_AVATAR_URLS.has(storedAvatarUrl))
  ) {
    return authAvatarUrl;
  }

  return storedAvatarUrl;
}
