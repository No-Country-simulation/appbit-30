'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { BienestarData, MoodTone } from '../types';
import { useTranslations } from 'next-intl';

interface Props {
  calendar: BienestarData['calendar'];
  hasCheckins?: boolean;
}

function getToneClass(tone: MoodTone) {
  if (tone === 'positive') return 'bg-emerald-100';
  if (tone === 'neutral') return 'bg-amber-50';
  if (tone === 'negative') return 'bg-red-100';
  return 'bg-transparent';
}

export function MoodCalendar({ calendar, hasCheckins = true }: Props) {
  const t = useTranslations('Bienestar');

  return (
    <section className='min-w-0 rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] p-4 sm:p-5'>
      <div className='flex items-center justify-between gap-3'>
        <button
          type='button'
          className='text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
          aria-label='Anterior'
        >
          <ChevronLeft className='size-5' />
        </button>

        <h3 className='break-words text-sm font-bold text-[var(--color-text)]'>
          {calendar.monthLabel}
        </h3>

        <button
          type='button'
          className='text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
          aria-label='Siguiente'
        >
          <ChevronRight className='size-5' />
        </button>
      </div>

      {!hasCheckins && (
        <div className='mt-4 rounded-[var(--radius-md)] bg-[var(--color-body)] px-4 py-3 text-center'>
          <p className='text-sm font-semibold text-[var(--color-text)]'>
            {t('sinCheckinsTitulo')}
          </p>
          <p className='mt-1 text-xs leading-relaxed text-[var(--color-text-muted)]'>
            {t('sinCheckinsDesc')}
          </p>
        </div>
      )}

      <div className='mt-4 grid grid-cols-7 gap-1 sm:gap-2'>
        {calendar.weekDays.map((day) => (
          <div
            key={day}
            className='text-center text-[10px] font-medium text-[var(--color-text-muted)] sm:text-xs'
          >
            {day}
          </div>
        ))}

        {calendar.days.map((item) => (
          <div
            key={item.key}
            className={`flex min-h-12 min-w-0 flex-col items-center justify-center gap-1 rounded-lg p-1 sm:min-h-14 ${getToneClass(
              item.tone,
            )}`}
          >
            {item.day != null && (
              <>
                <span className='text-[10px] font-medium leading-none text-[var(--color-text)] sm:text-xs'>
                  {item.day}
                </span>

                {item.emoji && (
                  <span className='text-base leading-none sm:text-lg'>
                    {item.emoji}
                  </span>
                )}
              </>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
