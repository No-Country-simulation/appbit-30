'use client';

import { useTranslations } from 'next-intl';
import { AppCard } from '@/src/components/app/AppCard';

export function PromedioSemanal() {
  const t = useTranslations('Bienestar');

  return (
    <AppCard className='space-y-3'>
      <h3 className='text-sm font-bold text-[var(--color-text)]'>{t('promedioSemanal')}</h3>

      <div className='flex items-end gap-1'>
        <span className='text-3xl font-bold text-[var(--color-text)]'>3.1</span>
        <span className='mb-1 text-sm text-[var(--color-text-muted)]'>/ 10</span>
      </div>

      <div className='h-2 w-full rounded-full bg-gray-200'>
        <div className='h-full w-[31%] rounded-full bg-violet-500' />
      </div>

      <p className='text-sm leading-relaxed text-[var(--color-text-muted)]'>
        {t('promedioBajo')}
      </p>
    </AppCard>
  );
}
