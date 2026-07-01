import { getCurrentUserState } from '@/src/server/auth/get-current-user-state';
import DashboardClient from './DashboardClient';

type Props = {
  params: Promise<{
    locale: string;
  }>;
  searchParams?: Promise<{
    onboarding?: string;
  }>;
};

export default async function DashboardScreen({
  params,
  searchParams,
}: Props) {
  const query = await searchParams;

  const state = await getCurrentUserState();

  const nombre = state.isAuthenticated
    ? (state.authUser?.user_metadata?.full_name ?? 'Usuario')
    : 'Invitado';

  const shouldOpenOnboarding =
    state.isAuthenticated && (state.needsOnboarding || query?.onboarding === '1');

  return (
    <DashboardClient
      nombre={nombre}
      shouldOpenOnboarding={shouldOpenOnboarding}
    />
  );
}
