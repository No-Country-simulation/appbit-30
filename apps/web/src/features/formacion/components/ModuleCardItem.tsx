'use client';

import { useTranslations } from 'next-intl';
import { ExternalLink, Lock, Play } from 'lucide-react';
import { AppCard } from '@/src/components/app/AppCard';
import { AppBadge } from '@/src/components/app/AppBadge';
import { AppButton } from '@/src/components/app/AppButton';
import { cn } from '@/lib/utils';

interface Props {
  titulo: string;
  descripcion: string;
  nivel: string;
  plataforma?: string | null;
  duracionDias?: number | null;
  desbloqueado: boolean;
  primaryLabel?: string;
  primaryIcon?: 'play' | 'external';
  onOpen: () => void;
  onValidarExterno: () => void;
}

export function ModuleCardItem({
  titulo,
  descripcion,
  nivel,
  plataforma,
  duracionDias,
  desbloqueado,
  primaryLabel,
  primaryIcon = 'external',
  onOpen,
  onValidarExterno,
}: Props) {
  const t = useTranslations('Formacion');
  const PrimaryIcon = primaryIcon === 'play' ? Play : ExternalLink;

  return (
    <AppCard
      className={cn(
        'flex min-w-0 max-w-full flex-col gap-4',
        !desbloqueado && 'opacity-60',
      )}
    >
      <div className='flex min-w-0 items-start gap-3'>
        {!desbloqueado && (
          <Lock className='mt-0.5 size-5 shrink-0 text-[var(--color-text-muted)]' />
        )}

        <div className='min-w-0 flex-1'>
          <h4 className='min-w-0 break-words text-sm font-bold leading-tight text-[var(--color-text)] sm:text-base'>
            {titulo}
          </h4>

          <p className='mt-1 min-w-0 break-words text-sm leading-relaxed text-[var(--color-text-muted)]'>
            {descripcion}
          </p>
        </div>
      </div>

      <div className='flex min-w-0 flex-wrap items-center gap-2'>
        <AppBadge variant='warning'>{nivel}</AppBadge>

        {plataforma && <AppBadge variant='primary'>{plataforma}</AppBadge>}

        {duracionDias != null && (
          <span className='text-xs text-[var(--color-text-muted)]'>
            {duracionDias} {t('dias')}
          </span>
        )}
      </div>

      <div className='flex min-w-0 flex-col gap-2'>
        <AppButton
          variant='primary'
          className='w-full !whitespace-nowrap'
          onClick={onOpen}
          disabled={!desbloqueado}
        >
          <PrimaryIcon className='size-4 shrink-0' />
          <span>{primaryLabel ?? t('abrirCurso')}</span>
        </AppButton>

        {desbloqueado && (
          <button
            type='button'
            onClick={onValidarExterno}
            className='inline-flex min-w-0 items-center justify-center gap-1.5 rounded-[var(--radius-md)] px-3 py-2 text-center text-xs font-semibold leading-snug text-[var(--color-primary)] hover:bg-[var(--color-primary-pale)]'
          >
            <ExternalLink className='size-3.5 shrink-0' />

            <span className='min-w-0 break-words'>
              {t('validarCertExterno')}
            </span>
          </button>
        )}
      </div>
    </AppCard>
  );
}
