import { getCurrentUserState } from '@/src/server/auth/get-current-user-state';
import DashboardClient from './DashboardClient';

type UserState = Awaited<ReturnType<typeof getCurrentUserState>>;

type Props = {
  state: UserState;
};

export default async function DashboardScreen({ state }: Props) {
  const nombre =
    state.usuario?.nombre_completo ??
    state.authUser?.user_metadata?.full_name ??
    'Usuario';

  const shouldOpenOnboarding = state.isAuthenticated && state.needsOnboarding;

  return (
    <DashboardClient
      nombre={nombre}
      shouldOpenOnboarding={shouldOpenOnboarding}
    />
  );
}
