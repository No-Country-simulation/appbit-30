'use client';

import { useTranslations } from 'next-intl';
import { AppCard } from '@/src/components/app/AppCard';

const items = [
  { labelKey: 'positivas', percent: 40, color: 'bg-emerald-500', barBg: 'bg-emerald-100' },
  { labelKey: 'neutras', percent: 20, color: 'bg-amber-400', barBg: 'bg-amber-100' },
  { labelKey: 'negativas', percent: 40, color: 'bg-red-500', barBg: 'bg-red-100' },
];

export function DesgloseMes() {
  const t = useTranslations('Bienestar');

  return (
    <AppCard className='space-y-4'>
      <h3 className='text-sm font-bold text-[var(--color-text)]'>{t('desgloseMes')}</h3>

      <div className='space-y-3'>
        {items.map(({ labelKey, percent, color, barBg }) => (
          <div key={labelKey} className='space-y-1'>
            <div className='flex justify-between text-sm'>
              <span className='text-[var(--color-text)]'>{t(labelKey)}</span>
              <span className='font-medium text-[var(--color-text)]'>{percent}%</span>
            </div>
            <div className={`h-2 rounded-full ${barBg}`}>
              <div
                className={`h-full rounded-full ${color}`}
                style={{ width: `${percent}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </AppCard>
  );
}
