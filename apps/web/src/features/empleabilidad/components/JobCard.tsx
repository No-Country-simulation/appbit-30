'use client';

/* eslint-disable @next/next/no-img-element */

import { useTranslations } from 'next-intl';
import { CheckCircle, MapPin } from 'lucide-react';
import { AppCard } from '@/src/components/app/AppCard';
import { AppButton } from '@/src/components/app/AppButton';
import { cn } from '@/lib/utils';
import type { MobilityInsight } from '../types';
import { MobilityInsightDisplay } from './MobilityInsightDisplay';

interface Props {
  source: 'local' | 'b2b';
  titulo: string;
  empresa: string;
  logoUrl: string | null;
  modalidad: string;
  ubicacion: string;
  matchPorcentaje: number | null;
  skills: string[];
  distancia?: string | null;
  movilidad: MobilityInsight;
  isApplied?: boolean;
  onClick: () => void;
  onAplicar: () => void;
}

export function JobCard({
  source,
  titulo,
  empresa,
  logoUrl,
  modalidad,
  ubicacion,
  matchPorcentaje,
  skills,
  distancia,
  movilidad,
  isApplied = false,
  onClick,
  onAplicar,
}: Props) {
  const t = useTranslations('Empleabilidad');

  return (
    <AppCard
      hover
      className='flex h-full min-w-0 cursor-pointer flex-col gap-4'
    >
      <button type='button' onClick={onClick} className='min-w-0 text-left'>
        <div className='flex min-w-0 items-start gap-4'>
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
            <h3 className='break-words text-base font-semibold leading-tight text-[var(--color-text)]'>
              {titulo}
            </h3>

            <p className='mt-1 break-words text-sm leading-relaxed text-[var(--color-text-muted)]'>
              {empresa} <span className='mx-1'>·</span> {modalidad}
            </p>

            <p className='mt-1 break-words text-xs text-[var(--color-text-muted)]'>
              {ubicacion}
            </p>
          </div>
        </div>
      </button>

      <div className='flex min-w-0 flex-wrap items-center gap-2'>
        {source === 'b2b' && (
          <span className='inline-flex max-w-full items-center rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700'>
            {t('oportunidadB2B')}
          </span>
        )}

        <span
          className={cn(
            'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold',
            matchPorcentaje !== null && matchPorcentaje >= 70
              ? 'bg-green-100 text-green-700'
              : 'bg-amber-100 text-amber-700',
          )}
        >
          {matchPorcentaje === null
            ? t('matchNoDisponible')
            : `${matchPorcentaje}% ${t('match')}`}
        </span>

        {isApplied && (
          <span className='inline-flex max-w-full items-center gap-1.5 rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700'>
            <CheckCircle className='size-3.5 shrink-0' />
            <span className='truncate'>{t('candidaturaEnviada')}</span>
          </span>
        )}

        {movilidad.category !== 'unavailable' ? (
          <MobilityInsightDisplay mobility={movilidad} />
        ) : distancia ? (
          <span className='inline-flex max-w-full items-center gap-1.5 rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700'>
            <MapPin className='size-3.5 shrink-0' />
            <span className='truncate'>{distancia}</span>
          </span>
        ) : null}
      </div>

      {skills.length > 0 && (
        <div className='flex min-w-0 flex-wrap gap-2'>
          {skills.slice(0, 4).map((skill) => (
            <span
              key={skill}
              className='max-w-full truncate rounded-full bg-[var(--color-primary-pale)] px-3 py-1 text-xs font-medium text-[var(--color-primary)]'
            >
              {skill}
            </span>
          ))}
        </div>
      )}

      <div className='mt-auto pt-2'>
        <AppButton
          variant={isApplied ? 'primary' : 'outline'}
          className='w-full !whitespace-nowrap'
          onClick={(event) => {
            event.stopPropagation();
            onAplicar();
          }}
        >
          {source === 'b2b'
            ? t('verOportunidad')
            : isApplied
              ? t('verCandidatura')
              : t('verYAplicar')}
        </AppButton>
      </div>
    </AppCard>
  );
}
