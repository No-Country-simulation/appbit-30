'use client';

import { useTranslations } from 'next-intl';
import { Building2, MapPin, PercentIcon, CalendarDays } from 'lucide-react';
import { AppCard } from '@/src/components/app/AppCard';
import { AppBadge } from '@/src/components/app/AppBadge';
import type { Postulacion } from '../types';

const estadoBadge = {
  Enviada: 'primary' as const,
  Vista: 'warning' as const,
  En_proceso: 'warning' as const,
  Rechazada: 'danger' as const,
  Aceptada: 'success' as const,
};

interface Props {
  postulacion: Postulacion;
}

export function ApplicationCard({ postulacion }: Props) {
  const t = useTranslations('Empleabilidad');
  const { vacante, estado, match_porcentaje, creado_en } = postulacion;

  return (
    <AppCard hover className='space-y-3'>
      <div className='flex items-start justify-between gap-2'>
        <div className='min-w-0 flex-1'>
          <h3 className='truncate text-sm font-bold text-[var(--color-text)]'>
            {vacante.titulo}
          </h3>
          <p className='flex items-center gap-1 text-xs text-[var(--color-text-muted)]'>
            <Building2 className='size-3.5 shrink-0' />
            <span className='truncate'>{vacante.empresa.nombre}</span>
          </p>
        </div>
        <AppBadge variant={estadoBadge[estado as keyof typeof estadoBadge] ?? 'primary'}>
          {t('estado' + estado)}
        </AppBadge>
      </div>

      <div className='flex flex-wrap gap-x-4 gap-y-1 text-xs text-[var(--color-text-muted)]'>
        <span className='flex items-center gap-1'>
          <MapPin className='size-3.5 shrink-0' />
          {t('modalidad' + vacante.modalidad)}
        </span>
        {match_porcentaje != null && (
          <span className='flex items-center gap-1'>
            <PercentIcon className='size-3.5 shrink-0' />
            {t('matchLabel', { porcentaje: match_porcentaje })}
          </span>
        )}
        <span className='flex items-center gap-1'>
          <CalendarDays className='size-3.5 shrink-0' />
          {new Date(creado_en).toLocaleDateString()}
        </span>
      </div>

      <div className='flex gap-1.5'>
        {['Enviada', 'Vista', 'En_proceso', 'Aceptada'].map((step, i) => (
          <div key={step} className='flex flex-1 items-center gap-0'>
            <div
              className={'h-1.5 flex-1 rounded-full transition-colors duration-300 ' + (
                ['Enviada', 'Vista', 'En_proceso', 'Aceptada'].indexOf(estado) >= i
                  ? 'bg-[var(--color-primary)]'
                  : 'bg-[var(--color-border)]'
              )}
            />
          </div>
        ))}
      </div>
    </AppCard>
  );
}
