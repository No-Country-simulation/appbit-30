import { redirect } from 'next/navigation';
import { getCurrentUserState } from '@/src/server/auth/get-current-user-state';
import AuthStateUnavailable from '@/src/features/auth/components/AuthStateUnavailable';
import MentoriaScreen from '@/src/features/mentoria/screens/MentoriaScreen';

export const dynamic = 'force-dynamic';

type Props = {
  params: Promise<{
    locale: string;
  }>;
};

export default async function MentoriaPage({ params }: Props) {
  const { locale } = await params;

  let state: Awaited<ReturnType<typeof getCurrentUserState>>;

  try {
    state = await getCurrentUserState();
  } catch (error) {
    console.error('Error resolving auth state for mentoria:', error);

    return <AuthStateUnavailable locale={locale} retryPath='/mentoria' />;
  }

  if (!state.isAuthenticated) {
    redirect(`/${locale}/auth`);
  }

  if (!state.usuario || state.needsOnboarding) {
    redirect(`/${locale}/dashboard`);
  }

  return (
    <MentoriaScreen usuarioId={state.usuario.usuario_id} locale={locale} />
  );
}
