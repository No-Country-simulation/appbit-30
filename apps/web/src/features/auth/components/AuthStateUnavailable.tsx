import { Link } from '@/src/i18n/navigation';
import { useTranslations } from 'next-intl';

type AuthStateUnavailableProps = {
  locale: string;
  retryPath?: string;
};

export default function AuthStateUnavailable({
  locale,
  retryPath = '/dashboard',
}: AuthStateUnavailableProps) {
  const t = useTranslations('Error');

  return (
    <main className='flex min-h-screen items-center justify-center bg-[var(--color-body)] px-6'>
      <section className='w-full max-w-md rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-card)] p-6 text-center shadow-[var(--shadow-md)]'>
        <h1 className='font-heading text-2xl font-bold text-[var(--color-text)]'>
          {t('title')}
        </h1>

        <p className='mt-3 font-body text-sm leading-6 text-[var(--color-text-muted)]'>
          {t('description')}
        </p>

        <div className='mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center'>
          <Link
            href={retryPath}
            locale={locale}
            className='rounded-[var(--radius-md)] bg-[var(--color-primary)] px-5 py-3 font-body text-sm font-semibold text-white'
          >
            {t('retry')}
          </Link>

          <Link
            href='/auth'
            locale={locale}
            className='rounded-[var(--radius-md)] border border-[var(--color-border)] px-5 py-3 font-body text-sm font-semibold text-[var(--color-text)]'
          >
            {t('goToLogin')}
          </Link>
        </div>
      </section>
    </main>
  );
}
