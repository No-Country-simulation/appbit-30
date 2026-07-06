'use client';

import { useTranslations } from 'next-intl';
import { AppCard } from '@/src/components/app/AppCard';
import { AppBadge } from '@/src/components/app/AppBadge';
import { AppButton } from '@/src/components/app/AppButton';

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
    <AppCard hover className='grid cursor-pointer grid-cols-2 gap-4'>
      <div className='space-y-3' onClick={onClick}>
        <div className='flex items-center gap-3'>
          <div className='flex size-10 items-center justify-center rounded-full bg-[var(--color-primary-pale)] text-sm font-bold text-[var(--color-primary)]'>
            {logoUrl ? (
              <img src={logoUrl} alt={empresa} className='size-10 rounded-full object-cover' />
            ) : (
              empresa.charAt(0).toUpperCase()
            )}
          </div>
          <div>
            <h3 className='font-medium text-[var(--color-text)]'>{titulo}</h3>
            <p className='text-xs text-[var(--color-text-muted)]'>{empresa}</p>
          </div>
        </div>
        <div className='flex flex-wrap gap-2'>
          <AppBadge variant='primary'>{modalidad}</AppBadge>
          <span className='text-xs text-[var(--color-text-muted)]'>{ubicacion}</span>
          {distancia && (
            <span className='text-xs text-[var(--color-text-muted)]'>{distancia}</span>
          )}
        </div>
      </div>

      <div className='flex flex-col items-end justify-between' onClick={onClick}>
        <AppBadge variant='success'>{matchPorcentaje}% match</AppBadge>
        <div className='flex flex-wrap justify-end gap-1'>
          {skills.slice(0, 3).map((s) => (
            <AppBadge key={s} variant='primary'>
              {s}
            </AppBadge>
          ))}
          {skills.length > 3 && (
            <AppBadge variant='primary'>+{skills.length - 3}</AppBadge>
          )}
        </div>
        <AppButton variant='primary' onClick={(e) => { e.stopPropagation(); onAplicar(); }}>
          {t('verYAplicar')}
        </AppButton>
      </div>
    </AppCard>
  );
}
