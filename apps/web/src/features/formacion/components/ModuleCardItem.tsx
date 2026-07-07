'use client';

import { useTranslations } from 'next-intl';
import { Lock, ExternalLink } from 'lucide-react';
import { AppCard } from '@/src/components/app/AppCard';
import { AppBadge } from '@/src/components/app/AppBadge';
import { AppButton } from '@/src/components/app/AppButton';

interface Props {
  titulo: string;
  descripcion: string;
  nivel: string;
  desbloqueado: boolean;
  onValidarExterno: () => void;
}

export function ModuleCardItem({
  titulo,
  descripcion,
  nivel,
  desbloqueado,
  onValidarExterno,
}: Props) {
  const t = useTranslations('Formacion');

  return (
    <AppCard className={`flex flex-col gap-3 ${!desbloqueado ? 'opacity-60' : ''}`}>
      <div className='flex items-start justify-between'>
        <div className='flex items-center gap-3'>
          {!desbloqueado && <Lock className='size-5 text-[var(--color-text-muted)]' />}
          <div>
            <h4 className='font-semibold text-[var(--color-text)]'>{titulo}</h4>
            <p className='mt-0.5 text-sm text-[var(--color-text-muted)]'>{descripcion}</p>
          </div>
        </div>
      </div>

      <div className='flex items-center justify-between'>
        <AppBadge variant='warning'>{nivel}</AppBadge>

        {desbloqueado && (
          <AppButton
            variant='outline'
            className='inline-flex items-center gap-1.5 text-xs'
            onClick={onValidarExterno}
          >
            <ExternalLink className='size-3.5' />
            {t('validarCertExterno')}
          </AppButton>
        )}
      </div>
    </AppCard>
  );
}
