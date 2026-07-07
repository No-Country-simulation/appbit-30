'use client';

import { useTranslations } from 'next-intl';
import { Star, MapPin, User } from 'lucide-react';
import { AppCard } from '@/src/components/app/AppCard';
import { AppBadge } from '@/src/components/app/AppBadge';
import { AppButton } from '@/src/components/app/AppButton';

interface Props {
  nombre: string;
  rol: string;
  empresa: string;
  skills: string[];
  esRemoto: boolean;
  rating: number;
  totalResenas: number;
  esTopMentor: boolean;
  onAgendar: () => void;
}

export function MentorCard({
  nombre,
  rol,
  empresa,
  skills,
  esRemoto,
  rating,
  totalResenas,
  esTopMentor,
  onAgendar,
}: Props) {
  const t = useTranslations('Mentoria');

  return (
    <AppCard className='flex flex-col gap-4'>
      <div className='flex items-start justify-between'>
        <div className='flex items-center gap-3'>
          <div className='flex size-12 items-center justify-center rounded-full bg-violet-100 text-violet-700'>
            <User className='size-6' />
          </div>
          <div>
            <h3 className='font-semibold text-[var(--color-text)]'>{nombre}</h3>
            <p className='text-sm text-[var(--color-text-muted)]'>
              {rol} en {empresa}
            </p>
          </div>
        </div>
        {esTopMentor && (
          <AppBadge variant='success'>{t('topMentor')}</AppBadge>
        )}
      </div>

      <div className='flex flex-wrap gap-1.5'>
        {skills.map((skill) => (
          <span
            key={skill}
            className='rounded-full bg-violet-50 px-2.5 py-0.5 text-xs font-medium text-violet-700'
          >
            {skill}
          </span>
        ))}
      </div>

      {esRemoto && (
        <div className='flex items-center gap-1.5 text-xs text-emerald-600'>
          <MapPin className='size-3.5' />
          <span>100% {t('remoto')} ({t('idealTrayecto')})</span>
        </div>
      )}

      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-1'>
          <Star className='size-4 fill-amber-400 text-amber-400' />
          <span className='text-sm font-semibold text-[var(--color-text)]'>{rating}</span>
          <span className='text-xs text-[var(--color-text-muted)]'>
            ({totalResenas} {t('reseñas')})
          </span>
        </div>
        <AppButton
          variant='primary'
          className='bg-emerald-600 text-white hover:bg-emerald-700 shadow-none'
          onClick={onAgendar}
        >
          {t('agendar')}
        </AppButton>
      </div>
    </AppCard>
  );
}
