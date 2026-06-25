import { redirect } from 'next/navigation';
import { getCurrentUserState } from '@/src/server/auth/get-current-user-state';
import { SignOutButton } from '../../auth/components/SignOutButton';
import { OnboardingModal } from '../../onboarding/screens/OnboardingModal';

type Props = {
  params: Promise<{
    locale: string;
  }>;
  searchParams?: Promise<{
    onboarding?: string;
  }>;
};

export default async function DashboardScreen({ params, searchParams }: Props) {
  const { locale } = await params;
  const query = await searchParams;

  const state = await getCurrentUserState();

  if (!state.isAuthenticated) {
    redirect(`/${locale}/auth`);
  }

  const shouldOpenOnboarding =
    state.needsOnboarding || query?.onboarding === '1';

  return (
    <main className='min-h-screen bg-[var(--color-body)] p-6'>
      <div className='mx-auto max-w-5xl'>
        <h1 className='font-heading text-3xl font-black text-[var(--color-text)]'>
          Dashboard
        </h1>

        <p className='mt-2 font-body text-sm text-[var(--color-text-muted)]'>
          Usuario autenticado: {state.authUser?.email}
        </p>

        {shouldOpenOnboarding && <OnboardingModal defaultOpen locked />}
        <div className='py-8'>
          <SignOutButton />
        </div>
      </div>
    </main>
  );
}
