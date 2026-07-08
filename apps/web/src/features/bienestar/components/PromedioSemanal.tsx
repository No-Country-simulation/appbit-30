'use client';

import { useTranslations } from 'next-intl';
import { AppCard } from '@/src/components/app/AppCard';

const desgloseItems = [
  { labelKey: 'positivas', percent: 40, emoji: '😊😃', textColor: 'text-[var(--color-text)]' },
  { labelKey: 'neutras', percent: 20, emoji: '😐', textColor: 'text-[var(--color-text)]' },
  { labelKey: 'negativas', percent: 40, emoji: '😢😩', textColor: 'text-red-600' },
];

export function PromedioSemanal() {
  const t = useTranslations('Bienestar');

  return (
    <AppCard className='space-y-4'>
      <p className='text-xs font-bold uppercase tracking-wider text-[var(--color-text-muted)]'>
        {t('promedioSemanal')}
      </p>

      <div className='flex items-end gap-1'>
        <span className='text-4xl font-bold text-red-500'>3.1</span>
        <span className='mb-1.5 text-sm text-[var(--color-text-muted)]'>/ 10</span>
      </div>

      <div className='h-2 w-full rounded-full bg-gray-200'>
        <div className='h-full w-[31%] rounded-full bg-gradient-to-r from-emerald-400 to-emerald-500' />
      </div>

      <p className='text-sm leading-relaxed text-[var(--color-text-muted)]'>
        {t('promedioBajo')}
      </p>

      <div className='border-t border-[var(--color-border)] pt-4'>
        <h4 className='mb-3 text-sm font-bold text-[var(--color-text)]'>{t('desgloseMes')}</h4>

        <div className='space-y-3'>
          {desgloseItems.map(({ labelKey, percent, emoji, textColor }) => (
            <div key={labelKey} className='flex items-center justify-between'>
              <span className={`text-sm ${textColor}`}>
                {t(labelKey)} ({emoji})
              </span>
              <span className={`text-sm font-bold ${textColor}`}>{percent}%</span>
            </div>
          ))}
        </div>
      </div>
    </AppCard>
  );
}
