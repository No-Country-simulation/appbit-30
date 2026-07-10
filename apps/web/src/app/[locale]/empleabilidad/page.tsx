import { redirect } from 'next/navigation';
import { getCurrentUserState } from '@/src/server/auth/get-current-user-state';
import AuthStateUnavailable from '@/src/features/auth/components/AuthStateUnavailable';
import EmployabilityScreen from '@/src/features/empleabilidad/screens/EmployabilityScreen';

export const dynamic = 'force-dynamic';

type Props = {
  params: Promise<{
    locale: string;
  }>;
};

export default async function EmpleabilidadPage({ params }: Props) {
  const { locale } = await params;

  let state: Awaited<ReturnType<typeof getCurrentUserState>>;

  try {
    state = await getCurrentUserState();
  } catch (error) {
    console.error('Error resolving auth state for empleabilidad:', error);

    return <AuthStateUnavailable locale={locale} retryPath='/empleabilidad' />;
  }

  if (!state.isAuthenticated) {
    redirect(`/${locale}/auth`);
  }

  if (!state.usuario || state.needsOnboarding) {
    redirect(`/${locale}/dashboard`);
  }

  return (
    <EmployabilityScreen usuarioId={state.usuario.usuario_id} locale={locale} />
  );
}
