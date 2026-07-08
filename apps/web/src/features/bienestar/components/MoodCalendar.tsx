'use client';

import { useTranslations } from 'next-intl';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const weekDays = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

const monthData = [
  { day: 18, emoji: '😄', bg: 'bg-emerald-100' },
  { day: 19, emoji: '😄', bg: 'bg-emerald-100' },
  { day: 20, emoji: '🙂', bg: 'bg-blue-100' },
  { day: 21, emoji: '😐', bg: 'bg-amber-50' },
  { day: 22, emoji: '😢', bg: 'bg-red-100' },
  { day: 23, emoji: '😩', bg: 'bg-red-200' },
  { day: 24, emoji: '😐', bg: 'bg-amber-50' },
  { day: 25, emoji: '🙂', bg: 'bg-blue-100' },
  { day: 26, emoji: '😄', bg: 'bg-emerald-100' },
  { day: 27, emoji: '😄', bg: 'bg-emerald-100' },
  { day: 28, emoji: '🙂', bg: 'bg-blue-100' },
  { day: 29, emoji: '😐', bg: 'bg-amber-50' },
  { day: 30, emoji: '😢', bg: 'bg-red-100' },
  { day: 31, emoji: '😩', bg: 'bg-red-200' },
  { day: 1, emoji: '😐', bg: 'bg-amber-50' },
  { day: 2, emoji: '🙂', bg: 'bg-blue-100' },
  { day: 3, emoji: '😄', bg: 'bg-emerald-100' },
  { day: 4, emoji: '😄', bg: 'bg-emerald-100' },
  { day: 5, emoji: '😐', bg: 'bg-amber-50' },
  { day: 6, emoji: '😢', bg: 'bg-red-100' },
  { day: 7, emoji: '😢', bg: 'bg-red-100' },
];

export function MoodCalendar() {
  const t = useTranslations('Bienestar');

  return (
    <section className='rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] p-5'>
      <div className='flex items-center justify-between'>
        <button className='text-[var(--color-text-muted)] hover:text-[var(--color-text)]'>
          <ChevronLeft className='size-5' />
        </button>
        <h3 className='text-sm font-bold text-[var(--color-text)]'>Octubre</h3>
        <button className='text-[var(--color-text-muted)] hover:text-[var(--color-text)]'>
          <ChevronRight className='size-5' />
        </button>
      </div>

      <div className='mt-4 grid grid-cols-7 gap-1'>
        {weekDays.map((day) => (
          <div key={day} className='text-center text-xs font-medium text-[var(--color-text-muted)]'>
            {day}
          </div>
        ))}
        {monthData.map(({ day, emoji, bg }) => (
          <div
            key={day}
            className={`flex flex-col items-center rounded-lg p-2 ${bg}`}
          >
            <span className='text-xs font-medium text-[var(--color-text)]'>{day}</span>
            <span className='text-lg'>{emoji}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
