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
        'inline-flex items-center gap-1 rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold text-orange-700',
        className,
      )}
    >
      <Flame className='size-3.5' />
      {count} {t('dias')} {t('racha')}
    </span>
  );
}
