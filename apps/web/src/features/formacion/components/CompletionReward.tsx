'use client';

import { useTranslations } from 'next-intl';
import { Trophy, Medal, Star } from 'lucide-react';
import { AppCard } from '@/src/components/app/AppCard';

interface Props {
  certificado: string;
  puntos: number;
  desbloquea: string;
}

export function CompletionReward({ certificado, puntos, desbloquea }: Props) {
  const t = useTranslations('Formacion');

  return (
    <AppCard className='space-y-4'>
      <div className='flex items-center gap-2'>
        <Trophy className='size-5 text-amber-500' />
        <h4 className='text-sm font-bold text-[var(--color-text)]'>
          {t('alCompletarObtenes')}
        </h4>
      </div>

      <div className='space-y-3'>
        <div className='flex items-center gap-3'>
          <Medal className='size-5 text-[var(--color-text)]' />
          <div>
            <span className='text-sm font-medium text-[var(--color-text)]'>
              {t('certificado')} {certificado}
            </span>
            <p className='text-xs text-[var(--color-text-muted)]'>{t('verificadoPorBit')}</p>
          </div>
        </div>

        <div className='flex items-center gap-3'>
          <Star className='size-5 text-[var(--color-text)]' />
          <span className='text-sm text-[var(--color-text-muted)]'>
            +{puntos} {t('puntosHabilidad')} · {t('desbloqueaModulo')}: {desbloquea}
          </span>
        </div>
      </div>
    </AppCard>
  );
}
