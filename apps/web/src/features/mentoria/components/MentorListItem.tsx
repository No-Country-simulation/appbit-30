'use client';

import { useTranslations } from 'next-intl';
import { Star, User } from 'lucide-react';
import { AppButton } from '@/src/components/app/AppButton';

interface Props {
  nombre: string;
  rol: string;
  rating: number;
  totalSesiones: number;
  onAgendar: () => void;
}

export function MentorListItem({
  nombre,
  rol,
  rating,
  totalSesiones,
  onAgendar,
}: Props) {
  const t = useTranslations('Mentoria');

  return (
    <article className='flex min-w-0 flex-col gap-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] p-4 sm:flex-row sm:items-center sm:justify-between'>
      <div className='flex min-w-0 items-center gap-3'>
        <div className='flex size-10 shrink-0 items-center justify-center rounded-full bg-violet-100 text-violet-700'>
          <User className='size-5' />
        </div>

        <div className='min-w-0'>
          <h4 className='break-words font-medium text-[var(--color-text)]'>
            {nombre}
          </h4>

          <p className='break-words text-sm text-[var(--color-text-muted)]'>
            {rol}
          </p>
        </div>
      </div>

      <div className='flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center'>
        <div className='flex min-w-0 items-center gap-1'>
          <Star className='size-4 shrink-0 fill-amber-400 text-amber-400' />

          <span className='text-sm font-medium text-[var(--color-text)]'>
            {rating}
          </span>

          <span className='min-w-0 truncate text-xs text-[var(--color-text-muted)]'>
            ({totalSesiones} {t('sesiones')})
          </span>
        </div>

        <AppButton
          variant='outline'
          className='w-full text-xs sm:w-auto'
          onClick={onAgendar}
        >
          {t('agendar')}
        </AppButton>
      </div>
    </article>
  );
}
