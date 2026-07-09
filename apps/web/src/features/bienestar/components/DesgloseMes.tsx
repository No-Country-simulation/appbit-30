'use client';

import { useTranslations } from 'next-intl';
import { AppCard } from '@/src/components/app/AppCard';

const items = [
  { labelKey: 'positivas', percent: 40, emoji: '😊😃', textColor: 'text-[var(--color-text)]' },
  { labelKey: 'neutras', percent: 20, emoji: '😐', textColor: 'text-[var(--color-text)]' },
  { labelKey: 'negativas', percent: 40, emoji: '😢😩', textColor: 'text-red-600' },
];

export function DesgloseMes() {
  const t = useTranslations('Bienestar');

  return (
    <AppCard className='space-y-4'>
      <h3 className='text-sm font-bold text-[var(--color-text)]'>{t('desgloseMes')}</h3>

      <div className='space-y-3'>
        {items.map(({ labelKey, percent, emoji, textColor }) => (
            <div key={labelKey} className='flex items-center justify-between'>
              <span className={`text-sm ${textColor}`}>
                {t(labelKey)} ({emoji})
              </span>
              <span className={`text-sm font-bold ${textColor}`}>{percent}%</span>
            </div>
        ))}
      </div>
    </AppCard>
  );
}
