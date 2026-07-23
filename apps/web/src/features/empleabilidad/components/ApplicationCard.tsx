'use client';

/* eslint-disable @next/next/no-img-element */

import { useTranslations } from 'next-intl';
import { GraduationCap, Mail } from 'lucide-react';
import { AppCard } from '@/src/components/app/AppCard';
import { AppBadge } from '@/src/components/app/AppBadge';
import { AppButton } from '@/src/components/app/AppButton';
import { ApplicationStepper } from './ApplicationStepper';
import type { PostulacionEstado } from '../types';

interface Props {
  titulo: string;
  empresa: string;
  estado: PostulacionEstado;
  logoUrl: string | null;
  matchPorcentaje?: number | null;
  feedback?: string | null;
  skillRechazada?: string | null;
  mensajesNuevos?: number;
  onVerMensajes?: () => void;
  onFortalecer?: () => void;
}

const ESTADO_CONFIG: Record<
  PostulacionEstado,
  {
    label: string;
    variant: 'primary' | 'success' | 'danger' | 'warning';
  }
> = {
  Enviada: { label: 'estadoEnviada', variant: 'primary' },
  Vista: { label: 'estadoVista', variant: 'primary' },
  En_proceso: { label: 'estadoEnRevision', variant: 'warning' },
  Rechazada: { label: 'noSeleccionado', variant: 'danger' },
  Aceptada: { label: 'estadoAceptada', variant: 'success' },
};

export function ApplicationCard({
  titulo,
  empresa,
  estado,
  logoUrl,
  matchPorcentaje,
  feedback,
  skillRechazada,
  mensajesNuevos,
  onVerMensajes,
  onFortalecer,
}: Props) {
  const t = useTranslations('Empleabilidad');
  const config = ESTADO_CONFIG[estado];
  const isActive = estado !== 'Rechazada';

  return (
    <AppCard className='min-w-0 space-y-4 overflow-hidden'>
      <div className='flex min-w-0 flex-col gap-3 sm:flex-row sm:items-start sm:justify-between'>
        <div className='flex min-w-0 items-center gap-3'>
          <div className='flex size-10 shrink-0 items-center justify-center rounded-xl bg-[var(--color-primary-pale)] text-sm font-bold text-[var(--color-primary)]'>
            {logoUrl ? (
              <img
                src={logoUrl}
                alt={empresa}
                className='size-10 rounded-xl object-cover'
              />
            ) : (
              empresa.charAt(0).toUpperCase()
            )}
          </div>

          <div className='min-w-0'>
            <h3 className='break-words font-semibold leading-tight text-[var(--color-text)]'>
              {titulo}
            </h3>

            <p className='mt-1 break-words text-sm text-[var(--color-text-muted)]'>
              {empresa}
            </p>
          </div>
        </div>

        <div className='flex shrink-0 flex-wrap items-center gap-2'>
          {typeof matchPorcentaje === 'number' && (
            <AppBadge variant='warning'>
              {matchPorcentaje}% {t('match')}
            </AppBadge>
          )}

          <AppBadge variant={config.variant}>{t(config.label)}</AppBadge>
        </div>
      </div>

      {isActive && (
        <div className='min-w-0 overflow-hidden'>
          <ApplicationStepper estadoActual={estado} />
        </div>
      )}

      {feedback && (
        <blockquote className='min-w-0 break-words rounded-lg border-l-4 border-[var(--color-primary)] bg-[var(--color-body)] p-4 text-sm italic leading-relaxed text-[var(--color-text-muted)]'>
          &ldquo;{feedback}&rdquo;
        </blockquote>
      )}

      <div className='flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
        <div className='min-w-0'>
          {mensajesNuevos != null && mensajesNuevos > 0 && (
            <span className='inline-flex max-w-full items-center gap-1.5 rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-600'>
              <Mail className='size-3.5 shrink-0' />
              <span className='truncate'>
                {mensajesNuevos === 1
                  ? t('mensajeNuevo', { count: '1' })
                  : t('mensajesNuevos', { count: String(mensajesNuevos) })}
              </span>
            </span>
          )}
        </div>

        <div className='flex min-w-0 flex-col gap-2 sm:flex-row sm:items-center'>
          {skillRechazada && onFortalecer && (
            <AppButton
              variant='outline'
              className='w-full !whitespace-nowrap sm:w-auto'
              onClick={onFortalecer}
            >
              <GraduationCap className='size-4 shrink-0' />
              {t('irAFortalecer', { skill: skillRechazada })}
            </AppButton>
          )}

          {onVerMensajes && (
            <AppButton
              variant='primary'
              className='w-full !rounded-full !whitespace-nowrap sm:w-auto'
              onClick={onVerMensajes}
            >
              {t('verMensajes')}
            </AppButton>
          )}
        </div>
      </div>
    </AppCard>
  );
}
