'use client';

import { useTranslations } from 'next-intl';
import { MapPin, Percent } from 'lucide-react';
import { AppCard } from '@/src/components/app/AppCard';
import { AppButton } from '@/src/components/app/AppButton';
import { cn } from '@/lib/utils';

interface Props {
  titulo: string;
  empresa: string;
  logoUrl?: string;
  modalidad: string;
  ubicacion: string;
  matchPorcentaje: number;
  skills: string[];
  distancia?: string;
  onClick: () => void;
  onAplicar: () => void;
}

export function JobCard({
  titulo,
  empresa,
  logoUrl,
  modalidad,
  ubicacion,
  matchPorcentaje,
  skills,
  distancia,
  onClick,
  onAplicar,
}: Props) {
  const t = useTranslations('Empleabilidad');

  return (
    <AppCard hover className='flex cursor-pointer flex-col gap-4'>
      <div onClick={onClick}>
        <div className='flex items-start gap-4'>
          <div className='flex size-12 shrink-0 items-center justify-center rounded-xl bg-[var(--color-primary-pale)] text-lg font-bold text-[var(--color-primary)]'>
            {logoUrl ? (
              <img
                src={logoUrl}
                alt={empresa}
                className='size-12 rounded-xl object-cover'
              />
            ) : (
              empresa.charAt(0).toUpperCase()
            )}
          </div>
          <div className='min-w-0'>
            <h3 className='truncate text-base font-semibold text-[var(--color-text)]'>
              {titulo}
            </h3>
            <p className='text-sm text-[var(--color-text-muted)]'>
              {empresa} <span className='mx-1'>·</span> {modalidad}
            </p>
          </div>
        </div>
      </div>

      <div className='flex items-center gap-2'>
        <span
          className={cn(
            'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold',
            matchPorcentaje >= 70
              ? 'bg-green-100 text-green-700'
              : 'bg-amber-100 text-amber-700',
          )}
        >
          <Percent className='size-3.5' />
          {matchPorcentaje}% Match
        </span>
        {distancia && (
          <span className='inline-flex items-center gap-1.5 rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700'>
            <MapPin className='size-3.5' />
            {distancia}
          </span>
        )}
      </div>

      {skills.length > 0 && (
        <div className='flex flex-wrap gap-2'>
          {skills.map((skill) => (
            <span
              key={skill}
              className='rounded-full bg-[var(--color-primary-pale)] px-3 py-1 text-xs font-medium text-[var(--color-primary)]'
            >
              {skill}
            </span>
          ))}
        </div>
      )}

      <AppButton
        variant='outline'
        className='w-full'
        onClick={(e) => {
          e.stopPropagation();
          onAplicar();
        }}
      >
        {t('verYAplicar')}
      </AppButton>
    </AppCard>
  );
}
