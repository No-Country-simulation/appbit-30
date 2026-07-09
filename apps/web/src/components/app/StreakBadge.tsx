'use client';

import { useTranslations } from 'next-intl';
import { Flame } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Props {
  count: number;
  className?: string;
}

export function StreakBadge({ count, className }: Props) {
  const t = useTranslations('Formacion');

  return (
    <span
      className={cn(
        'inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-2 text-white',
        className,
      )}
    >
      <Flame className='size-5' />
      <div className='flex flex-col items-start leading-tight'>
        <span className='text-sm font-bold'>{count} {t('dias')}</span>
        <span className='text-[10px] text-white/70'>{t('racha')}</span>
      </div>
    </span>
  );
}
