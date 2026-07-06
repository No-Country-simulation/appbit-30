'use client';

import { useTranslations } from 'next-intl';
import { AppCard } from '@/src/components/app/AppCard';
import { AppBadge } from '@/src/components/app/AppBadge';
import { AppButton } from '@/src/components/app/AppButton';
import { ApplicationStepper } from './ApplicationStepper';

interface Props {
  titulo: string;
  empresa: string;
  estado: string;
  matchPorcentaje?: number;
  feedback?: string;
  skillRechazada?: string;
  onVerMensajes?: () => void;
  onFortalecer?: () => void;
}

const ESTADO_VARIANT: Record<string, 'primary' | 'success' | 'danger' | 'warning'> = {
  Enviada: 'primary',
  Vista: 'primary',
  En_proceso: 'warning',
  Rechazada: 'danger',
  Aceptada: 'success',
};

export function ApplicationCard({
  titulo,
  empresa,
  estado,
  matchPorcentaje,
  feedback,
  skillRechazada,
  onVerMensajes,
  onFortalecer,
}: Props) {
  const t = useTranslations('Empleabilidad');

  return (
    <AppCard className='space-y-4'>
      <div className='flex items-start justify-between'>
        <div>
          <h3 className='font-medium text-[var(--color-text)]'>{titulo}</h3>
          <p className='text-sm text-[var(--color-text-muted)]'>{empresa}</p>
        </div>
        <div className='flex items-center gap-2'>
          {matchPorcentaje != null && (
            <AppBadge variant='success'>{matchPorcentaje}% match</AppBadge>
          )}
          <AppBadge variant={ESTADO_VARIANT[estado] ?? 'primary'}>
            {t(`estado${estado}` as any)}
          </AppBadge>
        </div>
      </div>

      <ApplicationStepper
        estadoActual={estado as 'Enviada' | 'Vista' | 'En_proceso' | 'Rechazada' | 'Aceptada'}
      />

      {feedback && (
        <div className='rounded-lg bg-[var(--color-danger-bg)] p-4 text-sm text-[var(--color-danger-text)]'>
          <p>{feedback}</p>
          {skillRechazada && onFortalecer && (
            <AppButton
              variant='outline'
              className='mt-2'
              onClick={onFortalecer}
            >
              {t('irAFortalecer', { skill: skillRechazada })}
            </AppButton>
          )}
        </div>
      )}

      {onVerMensajes && (
        <AppButton variant='outline' onClick={onVerMensajes}>
          {t('verMensajes')}
        </AppButton>
      )}
    </AppCard>
  );
}
