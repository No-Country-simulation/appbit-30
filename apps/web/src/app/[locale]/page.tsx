import { Link } from '@/src/i18n/navigation';
import { getTranslations } from 'next-intl/server';

export default async function HomePage() {
  const t = await getTranslations('Navigation');

  return (
    <main className='flex min-h-screen flex-col items-center justify-center gap-4 bg-[var(--color-body)] p-6'>
      <h1 className='font-heading text-4xl font-black text-[var(--color-text)]'>
        Bi.T
      </h1>

      <div className='flex gap-3'>
        <Link
          href='/playground'
          className='rounded-[var(--radius-md)] bg-[var(--color-primary)] px-5 py-3 font-body font-semibold text-white'
        >
          {t('playground')}
        </Link>

        <Link
          href='/auth'
          className='rounded-[var(--radius-md)] border border-[var(--color-border)] px-5 py-3 font-body font-semibold text-[var(--color-text)]'
        >
          {t('auth')}
        </Link>
      </div>
    </main>
  );
}
