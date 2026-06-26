import { AuthForm } from '../components/AuthForm';
import { AuthHero } from '../components/AuthHero';

type Props = {
  initialError?: string;
};

export default function AuthScreen({ initialError }: Props) {
  return (
    <main className='min-h-screen bg-[var(--color-body)]'>
      <div className='grid min-h-screen grid-cols-1 lg:grid-cols-[minmax(0,1fr)_460px] xl:grid-cols-[minmax(0,1fr)_500px]'>
        <AuthHero />

        <section className='flex min-h-screen items-center justify-center px-4 py-10 sm:px-6 lg:px-10'>
          <div className='w-full max-w-sm rounded-[var(--radius-lg)] bg-[var(--color-card)] p-6 shadow-[var(--shadow-md)] sm:p-8 lg:shadow-none'>
            <AuthForm initialError={initialError} />
          </div>
        </section>
      </div>
    </main>
  );
}
