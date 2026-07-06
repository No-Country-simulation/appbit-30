'use client';

import { useTranslations } from 'next-intl';
import { GraduationCap, Mail } from 'lucide-react';
import { AppCard } from '@/src/components/app/AppCard';
import { AppBadge } from '@/src/components/app/AppBadge';
import { AppButton } from '@/src/components/app/AppButton';
import { ApplicationStepper } from './ApplicationStepper';

interface Props {
  titulo: string;
  empresa: string;
  estado: string;
  logoUrl?: string;
  matchPorcentaje?: number;
  feedback?: string;
  skillRechazada?: string;
  mensajesNuevos?: number;
  onVerMensajes?: () => void;
  onFortalecer?: () => void;
}

const ESTADO_CONFIG: Record<string, { label: string; variant: 'primary' | 'success' | 'danger' | 'warning' }> = {
  Enviada: { label: 'estadoEnviada', variant: 'primary' },
  Vista: { label: 'estadoVista', variant: 'primary' },
  En_revision: { label: 'estadoEnRevision', variant: 'warning' },
  Rechazada: { label: 'noSeleccionado', variant: 'danger' },
  Aceptada: { label: 'estadoAceptada', variant: 'success' },
  Cerrado: { label: 'estadoCerrado', variant: 'warning' },
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
  const config = ESTADO_CONFIG[estado] ?? ESTADO_CONFIG.Enviada;
  const isActive = !['Rechazada', 'Cerrado'].includes(estado);

  return (
    <AppCard className='space-y-4'>
      <div className='flex items-start justify-between'>
        <div className='flex items-center gap-3'>
          <div className='flex size-10 shrink-0 items-center justify-center rounded-xl bg-[var(--color-primary-pale)] text-sm font-bold text-[var(--color-primary)]'>
            {logoUrl ? (
              <img src={logoUrl} alt={empresa} className='size-10 rounded-xl object-cover' />
            ) : (
              empresa.charAt(0).toUpperCase()
            )}
          </div>
          <div>
            <h3 className='font-semibold text-[var(--color-text)]'>{titulo}</h3>
            <p className='text-sm text-[var(--color-text-muted)]'>{empresa}</p>
          </div>
        </div>
        <AppBadge variant={config.variant}>{t(config.label as any)}</AppBadge>
      </div>

      {isActive && (
        <ApplicationStepper
          estadoActual={estado as 'Enviada' | 'Vista' | 'En_revision' | 'Rechazada' | 'Aceptada'}
        />
      )}

      {feedback && (
        <blockquote className='border-l-4 border-[var(--color-primary)] bg-[var(--color-body)] p-4 text-sm italic text-[var(--color-text-muted)]'>
          &ldquo;{feedback}&rdquo;
        </blockquote>
      )}

      <div className='flex items-center justify-between'>
        <div>
          {mensajesNuevos != null && mensajesNuevos > 0 && (
            <span className='inline-flex items-center gap-1.5 rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-600'>
              <Mail className='size-3.5' />
              {mensajesNuevos === 1
                ? t('mensajeNuevo', { count: '1' })
                : t('mensajesNuevos', { count: String(mensajesNuevos) })}
            </span>
          )}
        </div>

        <div className='flex items-center gap-2'>
          {skillRechazada && onFortalecer && (
            <AppButton variant='outline' onClick={onFortalecer}>
              <GraduationCap className='mr-1.5 size-4' />
              {t('irAFortalecer', { skill: skillRechazada })}
            </AppButton>
          )}

          {onVerMensajes && (
            <AppButton
              variant='primary'
              className='!rounded-full'
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
