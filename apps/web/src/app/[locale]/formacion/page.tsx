import FormacionScreen from '@/src/features/formacion/screens/FormacionScreen';
import { redirect } from 'next/navigation';
import { getCurrentUserState } from '@/src/server/auth/get-current-user-state';
import AuthStateUnavailable from '@/src/features/auth/components/AuthStateUnavailable';

export const dynamic = 'force-dynamic';

type Props = {
  params: Promise<{
    locale: string;
  }>;
};

export default async function FormacionPage({ params }: Props) {
  const { locale } = await params;

  let state: Awaited<ReturnType<typeof getCurrentUserState>>;

  try {
    state = await getCurrentUserState();
  } catch (error) {
    console.error('Error resolving auth state for formacion:', error);

    return <AuthStateUnavailable locale={locale} retryPath='/formacion' />;
  }

  if (!state.isAuthenticated) {
    redirect(`/${locale}/auth`);
  }

  if (!state.usuario || state.needsOnboarding) {
    redirect(`/${locale}/dashboard`);
  }

  return (
    <FormacionScreen usuarioId={state.usuario.usuario_id} locale={locale} />
  );
}
