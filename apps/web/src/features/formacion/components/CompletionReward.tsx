'use client';

import { useTranslations } from 'next-intl';
import { Award, Star, Unlock } from 'lucide-react';
import { AppCard } from '@/src/components/app/AppCard';

interface Props {
  certificado: string;
  puntos: number;
  desbloquea: string;
}

export function CompletionReward({ certificado, puntos, desbloquea }: Props) {
  const t = useTranslations('Formacion');

  return (
    <AppCard className='space-y-4 border-2 border-amber-200 bg-amber-50'>
      <h4 className='text-sm font-bold text-amber-800'>
        {t('alCompletarObtenes')}
      </h4>

      <div className='space-y-3'>
        <div className='flex items-center gap-3'>
          <Award className='size-5 text-amber-600' />
          <span className='text-sm text-amber-800'>
            {t('certificado')} {certificado}
          </span>
        </div>

        <div className='flex items-center gap-3'>
          <Star className='size-5 text-amber-600' />
          <span className='text-sm text-amber-800'>
            +{puntos} {t('puntosHabilidad')}
          </span>
        </div>

        <div className='flex items-center gap-3'>
          <Unlock className='size-5 text-amber-600' />
          <span className='text-sm text-amber-800'>
            {t('desbloqueaModulo')}: {desbloquea}
          </span>
        </div>
      </div>
    </AppCard>
  );
}
