import { redirect } from 'next/navigation';
import { getCurrentUserState } from '@/src/server/auth/get-current-user-state';
import AuthStateUnavailable from '@/src/features/auth/components/AuthStateUnavailable';
import BienestarScreen from '@/src/features/bienestar/screens/BienestarScreen';

export const dynamic = 'force-dynamic';

type Props = {
  params: Promise<{
    locale: string;
  }>;
};

export default async function BienestarPage({ params }: Props) {
  const { locale } = await params;

  let state: Awaited<ReturnType<typeof getCurrentUserState>>;

  try {
    state = await getCurrentUserState();
  } catch (error) {
    console.error('Error resolving auth state for bienestar:', error);

    return <AuthStateUnavailable locale={locale} retryPath='/bienestar' />;
  }

  if (!state.isAuthenticated) {
    redirect(`/${locale}/auth`);
  }

  if (!state.usuario || state.needsOnboarding) {
    redirect(`/${locale}/dashboard`);
  }

  return (
    <BienestarScreen usuarioId={state.usuario.usuario_id} locale={locale} />
  );
}
