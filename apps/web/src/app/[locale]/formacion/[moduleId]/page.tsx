import { redirect } from 'next/navigation';
import { getCurrentUserState } from '@/src/server/auth/get-current-user-state';
import AuthStateUnavailable from '@/src/features/auth/components/AuthStateUnavailable';
import ModulePlayerScreen from '@/src/features/formacion/screens/ModulePlayerScreen';

export const dynamic = 'force-dynamic';

type Props = {
  params: Promise<{
    locale: string;
    moduleId: string;
  }>;
};

export default async function ModulePage({ params }: Props) {
  const { locale, moduleId } = await params;

  let state: Awaited<ReturnType<typeof getCurrentUserState>>;

  try {
    state = await getCurrentUserState();
  } catch (error) {
    console.error('Error resolving auth state for module:', error);

    return (
      <AuthStateUnavailable
        locale={locale}
        retryPath={`/formacion/${moduleId}`}
      />
    );
  }

  if (!state.isAuthenticated) {
    redirect(`/${locale}/auth`);
  }

  if (!state.usuario || state.needsOnboarding) {
    redirect(`/${locale}/dashboard`);
  }

  return (
    <ModulePlayerScreen
      usuarioId={state.usuario.usuario_id}
      locale={locale}
      moduleId={moduleId}
    />
  );
}
