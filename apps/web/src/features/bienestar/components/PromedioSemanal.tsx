'use client';

import { useTranslations } from 'next-intl';
import { AppCard } from '@/src/components/app/AppCard';
import { ProgressBar } from '@/src/components/app/ProgressBar';

export function PromedioSemanal() {
  const t = useTranslations('Bienestar');

  return (
    <AppCard className='space-y-3'>
      <h3 className='text-sm font-bold text-[var(--color-text)]'>{t('promedioSemanal')}</h3>

      <div className='flex items-end gap-1'>
        <span className='text-3xl font-bold text-[var(--color-text)]'>3.1</span>
        <span className='mb-1 text-sm text-[var(--color-text-muted)]'>/ 10</span>
      </div>

      <ProgressBar value={31} className='bg-gray-200' barClassName='bg-violet-500' />

      <p className='text-sm leading-relaxed text-[var(--color-text-muted)]'>
        {t('promedioBajo')}
      </p>
    </AppCard>
  );
}
