import DashboardScreen from '@/src/features/dashboard/screens/DashboardScreen';
import { redirect } from 'next/navigation';
import { getCurrentUserState } from '@/src/server/auth/get-current-user-state';
import AuthStateUnavailable from '@/src/features/auth/components/AuthStateUnavailable';

export const dynamic = 'force-dynamic';

type Props = {
  params: Promise<{
    locale: string;
  }>;
};

export default async function DashboardPage({ params }: Props) {
  const { locale } = await params;

  let state: Awaited<ReturnType<typeof getCurrentUserState>>;

  try {
    state = await getCurrentUserState();
  } catch (error) {
    console.error('Error resolving auth state for dashboard:', error);

    return <AuthStateUnavailable locale={locale} retryPath='/dashboard' />;
  }

  if (!state.isAuthenticated) {
    redirect(`/${locale}/auth`);
  }

  return <DashboardScreen state={state} />;
}
