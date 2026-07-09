'use client';

import { useTranslations } from 'next-intl';
import { AppCard } from '@/src/components/app/AppCard';
import type { BienestarBreakdown } from '../types';

interface Props {
  average: number | null;
  breakdown: BienestarBreakdown;
}

function getAverageColor(average: number | null) {
  if (average == null) return 'text-[var(--color-text-muted)]';
  if (average >= 7) return 'text-[var(--color-success)]';
  if (average >= 5.5) return 'text-[var(--color-warning)]';
  return 'text-red-500';
}

export function PromedioSemanal({ average, breakdown }: Props) {
  const t = useTranslations('Bienestar');

  const value = average ?? 0;
  const percent = Math.max(0, Math.min(100, value * 10));

  const desgloseItems = [
    {
      labelKey: 'positivas',
      percent: breakdown.positivePercent,
      emoji: '😊😃',
      textColor: 'text-[var(--color-text)]',
    },
    {
      labelKey: 'neutras',
      percent: breakdown.neutralPercent,
      emoji: '😐',
      textColor: 'text-[var(--color-text)]',
    },
    {
      labelKey: 'negativas',
      percent: breakdown.negativePercent,
      emoji: '😢😩',
      textColor: 'text-red-600',
    },
  ];

  return (
    <AppCard className='min-w-0 space-y-4'>
      <p className='break-words text-xs font-bold uppercase tracking-wider text-[var(--color-text-muted)]'>
        {t('promedioSemanal')}
      </p>

      <div className='flex items-end gap-1'>
        <span className={`text-4xl font-bold ${getAverageColor(average)}`}>
          {average != null ? average.toFixed(1) : '—'}
        </span>
        <span className='mb-1.5 text-sm text-[var(--color-text-muted)]'>
          / 10
        </span>
      </div>

      <div className='h-2 w-full overflow-hidden rounded-full bg-gray-200'>
        <div
          className='h-full rounded-full bg-gradient-to-r from-emerald-400 to-emerald-500'
          style={{ width: `${percent}%` }}
        />
      </div>

      <p className='break-words text-sm leading-relaxed text-[var(--color-text-muted)]'>
        {average != null && average < 5.5
          ? t('promedioBajo')
          : t('promedioEstable')}
      </p>

      <div className='border-t border-[var(--color-border)] pt-4'>
        <h4 className='mb-3 break-words text-sm font-bold text-[var(--color-text)]'>
          {t('desgloseMes')}
        </h4>

        <div className='space-y-3'>
          {desgloseItems.map(({ labelKey, percent, emoji, textColor }) => (
            <div
              key={labelKey}
              className='flex min-w-0 items-center justify-between gap-3'
            >
              <span className={`min-w-0 break-words text-sm ${textColor}`}>
                {t(labelKey)} ({emoji})
              </span>

              <span className={`shrink-0 text-sm font-bold ${textColor}`}>
                {percent}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </AppCard>
  );
}
