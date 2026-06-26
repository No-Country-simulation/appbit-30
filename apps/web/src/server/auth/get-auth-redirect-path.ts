import { getCurrentUserState } from './get-current-user-state';

export async function getAuthRedirectPath(locale: string) {
  const state = await getCurrentUserState();

  if (!state.isAuthenticated) {
    return `/${locale}/auth`;
  }

  if (state.needsOnboarding) {
    return `/${locale}/dashboard?onboarding=1`;
  }

  return `/${locale}/dashboard`;
}
