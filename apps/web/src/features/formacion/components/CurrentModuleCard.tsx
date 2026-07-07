'use client';

import { useTranslations } from 'next-intl';
import { Download, Play } from 'lucide-react';
import { AppCard } from '@/src/components/app/AppCard';
import { AppButton } from '@/src/components/app/AppButton';
import { ProgressBar } from '@/src/components/app/ProgressBar';
import { StreakBadge } from '@/src/components/app/StreakBadge';

interface Props {
  titulo: string;
  progreso: number;
  racha: number;
  onContinuar: () => void;
  onGuardarOffline: () => void;
}

export function CurrentModuleCard({
  titulo,
  progreso,
  racha,
  onContinuar,
  onGuardarOffline,
}: Props) {
  const t = useTranslations('Formacion');

  return (
    <div className='rounded-xl bg-gradient-to-br from-violet-600 to-purple-700 p-6 text-white'>
      <p className='mb-1 text-xs font-medium uppercase tracking-wider text-white/60'>
        {t('moduloActual')}
      </p>

      <h3 className='text-lg font-bold'>{titulo}</h3>

      <div className='mt-4 space-y-2'>
        <div className='flex items-center justify-between text-sm'>
          <span className='text-white/80'>{progreso}%</span>
          <StreakBadge count={racha} className='bg-white/20 text-white' />
        </div>
        <ProgressBar value={progreso} className='bg-white/20' barClassName='bg-amber-400' />
      </div>

      <div className='mt-5 flex gap-3'>
        <AppButton
          variant='primary'
          className='inline-flex items-center gap-2 bg-amber-400 text-violet-900 hover:bg-amber-500 shadow-none'
          onClick={onContinuar}
        >
          <Play className='size-4' />
          {t('continuar')}
        </AppButton>

        <AppButton
          variant='outline'
          className='inline-flex items-center gap-2 border-white/30 text-white hover:bg-white/10'
          onClick={onGuardarOffline}
        >
          <Download className='size-4' />
          {t('guardarOffline')}
        </AppButton>
      </div>
    </div>
  );
}
