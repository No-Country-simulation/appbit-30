import { redirect } from 'next/navigation';
import AuthScreen from '@/src/features/auth/screens/AuthScreen';
import { getAuthRedirectPath } from '@/src/server/auth/get-auth-redirect-path';
import { getCurrentUserState } from '@/src/server/auth/get-current-user-state';

type Props = {
  params: Promise<{
    locale: string;
  }>;
  searchParams?: Promise<{
    error?: string;
  }>;
};

export default async function AuthPage({ params, searchParams }: Props) {
  const { locale } = await params;
  const query = await searchParams;

  const state = await getCurrentUserState();

  if (state.isAuthenticated) {
    redirect(await getAuthRedirectPath(locale));
  }

  return <AuthScreen initialError={query?.error} />;
}
