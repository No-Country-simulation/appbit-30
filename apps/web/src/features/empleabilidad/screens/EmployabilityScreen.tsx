import { redirect } from 'next/navigation';
import { getCurrentUserState } from '@/src/server/auth/get-current-user-state';
import AuthStateUnavailable from '@/src/features/auth/components/AuthStateUnavailable';
import EmployabilityClient from './EmployabilityClient';

type Props = {
  params: Promise<{ locale: string }>;
  searchParams?: Promise<Record<string, string>>;
};

export default async function EmployabilityScreen({ params, searchParams }: Props) {
  const { locale } = await params;
  let state: Awaited<ReturnType<typeof getCurrentUserState>>;

  try {
    state = await getCurrentUserState();
  } catch (error) {
    console.error('Error resolving auth state for employability:', error);
    return <AuthStateUnavailable locale={locale} retryPath='/empleabilidad' />;
  }

  if (!state.isAuthenticated) {
    redirect(`/${locale}/auth`);
  }

  return <EmployabilityClient />;
}
