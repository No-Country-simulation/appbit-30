import { redirect } from 'next/navigation';
import { getCurrentUserState } from '@/src/server/auth/get-current-user-state';
import PlaygroundScreen from '@/src/features/design-system/screens/PlaygroundScreen';
import AuthStateUnavailable from '@/src/features/auth/components/AuthStateUnavailable';

type Props = {
  params: Promise<{
    locale: string;
  }>;
};

export default async function PlaygroundPage({ params }: Props) {
  const { locale } = await params;

  let state: Awaited<ReturnType<typeof getCurrentUserState>>;

  try {
    state = await getCurrentUserState();
  } catch (error) {
    console.error('Error resolving auth state for playground:', error);

    return <AuthStateUnavailable locale={locale} retryPath='/playground' />;
  }

  if (!state.isAuthenticated) {
    redirect(`/${locale}/auth`);
  }

  if (state.needsOnboarding) {
    redirect(`/${locale}/dashboard?onboarding=1`);
  }

  return <PlaygroundScreen />;
}
