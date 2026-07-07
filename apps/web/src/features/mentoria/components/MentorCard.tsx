'use client';

/* eslint-disable @next/next/no-img-element */

import { useTranslations } from 'next-intl';
import { Star, User } from 'lucide-react';
import { AppBadge } from '@/src/components/app/AppBadge';
import { AppButton } from '@/src/components/app/AppButton';

interface Props {
  foto?: string;
  nombre: string;
  rol: string;
  empresa: string;
  skills: string[];
  rating: number;
  totalResenas: number;
  esTopMentor: boolean;
  onAgendar: () => void;
}

export function MentorCard({
  foto,
  nombre,
  rol,
  empresa,
  skills,
  rating,
  totalResenas,
  esTopMentor,
  onAgendar,
}: Props) {
  const t = useTranslations('Mentoria');

  return (
    <div className='overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] shadow-[var(--shadow-md)]'>
      <div className='relative aspect-[16/10] w-full bg-gray-200'>
        {foto ? (
          <img src={foto} alt={nombre} className='size-full object-cover' />
        ) : (
          <div className='flex size-full items-center justify-center'>
            <User className='size-16 text-gray-400' />
          </div>
        )}

        {esTopMentor && (
          <div className='absolute left-3 top-3'>
            <AppBadge variant='success' className='shadow-sm'>
              ⭐ {t('topMentor')}
            </AppBadge>
          </div>
        )}
      </div>

      <div className='p-4'>
        <h3 className='text-base font-bold text-[var(--color-text)]'>{nombre}</h3>
        <p className='mt-0.5 text-sm text-[var(--color-text-muted)]'>
          {rol} en {empresa}
        </p>

        <div className='mt-3 flex flex-wrap gap-1.5'>
          {skills.map((skill) => (
            <span
              key={skill}
              className='rounded-full bg-violet-50 px-2.5 py-0.5 text-xs font-medium text-violet-700'
            >
              {skill}
            </span>
          ))}
        </div>

        <div className='mt-4 flex items-center justify-between'>
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
      </div>
    </div>
  );
}
