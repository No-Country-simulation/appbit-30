import { redirect } from 'next/navigation';
import { getCurrentUserState } from '@/src/server/auth/get-current-user-state';
import PlaygroundScreen from '@/src/features/design-system/screens/PlaygroundScreen';

type Props = {
  params: Promise<{
    locale: string;
  }>;
};

export default async function PlaygroundPage({ params }: Props) {
  const { locale } = await params;

  const state = await getCurrentUserState();

  if (!state.isAuthenticated) {
    redirect(`/${locale}/auth`);
  }

  if (state.needsOnboarding) {
    redirect(`/${locale}/dashboard?onboarding=1`);
  }

  return <PlaygroundScreen />;
}
