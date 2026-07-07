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

export function MentorListItem({ nombre, rol, rating, totalSesiones, onAgendar }: Props) {
  const t = useTranslations('Mentoria');

  return (
    <div className='flex items-center justify-between rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] p-4'>
      <div className='flex items-center gap-3'>
        <div className='flex size-10 items-center justify-center rounded-full bg-violet-100 text-violet-700'>
          <User className='size-5' />
        </div>
        <div>
          <h4 className='font-medium text-[var(--color-text)]'>{nombre}</h4>
          <p className='text-sm text-[var(--color-text-muted)]'>{rol}</p>
        </div>
      </div>

      <div className='flex items-center gap-4'>
        <div className='flex items-center gap-1'>
          <Star className='size-4 fill-amber-400 text-amber-400' />
          <span className='text-sm font-medium text-[var(--color-text)]'>{rating}</span>
          <span className='text-xs text-[var(--color-text-muted)]'>
            ({totalSesiones} {t('sesiones')})
          </span>
        </div>
        <AppButton variant='outline' className='text-xs' onClick={onAgendar}>
          {t('agendar')}
        </AppButton>
      </div>
    </div>
  );
}
