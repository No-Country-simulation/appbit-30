'use client';

import { useTranslations } from 'next-intl';
import { Download, ExternalLink, Play } from 'lucide-react';
import { AppButton } from '@/src/components/app/AppButton';
import { ProgressBar } from '@/src/components/app/ProgressBar';
import { StreakBadge } from '@/src/components/app/StreakBadge';

interface Props {
  titulo: string;
  progreso: number;
  racha: number;
  canSaveOffline?: boolean;
  primaryLabel?: string;
  onContinuar: () => void;
  onGuardarOffline: () => void;
  showProgress?: boolean;
  primaryIcon?: 'play' | 'external';
}

export function CurrentModuleCard({
  titulo,
  progreso,
  racha,
  canSaveOffline = false,
  primaryLabel,
  onContinuar,
  onGuardarOffline,
  primaryIcon,
  showProgress,
}: Props) {
  const t = useTranslations('Formacion');

  const PrimaryIcon = primaryIcon === 'external' ? ExternalLink : Play;

  return (
    <section className='min-w-0 overflow-hidden rounded-xl bg-gradient-to-br from-violet-600 to-purple-700 p-4 text-white sm:p-6'>
      <div className='flex min-w-0 flex-col gap-4 sm:flex-row sm:items-start sm:justify-between'>
        <div className='min-w-0'>
          <p className='mb-1 text-xs font-medium uppercase tracking-wider text-white/60'>
            {t('moduloActual')}
          </p>

          <h3 className='min-w-0 break-words text-lg font-bold leading-tight sm:text-xl'>
            {titulo}
          </h3>
        </div>

        <StreakBadge
          count={racha}
          className='w-fit shrink-0 bg-white/20 text-white'
        />
      </div>

      {showProgress && (
        <div className='mt-5 space-y-2'>
          <div className='flex items-center justify-between text-sm'>
            <span className='text-white/80'>{progreso}%</span>
          </div>

          <ProgressBar
            value={progreso}
            className='bg-white/20'
            barClassName='bg-amber-400'
          />
        </div>
      )}

      <div className='mt-5 flex min-w-0 flex-col gap-3 sm:flex-row'>
        <AppButton
          variant='primary'
          className='inline-flex w-full items-center gap-2 bg-amber-400 text-violet-900 shadow-none hover:bg-amber-500 sm:w-auto'
          onClick={onContinuar}
        >
          <PrimaryIcon className='size-4 shrink-0' />
          {primaryLabel ?? t('continuar')}
        </AppButton>

        {canSaveOffline && (
          <AppButton
            variant='outline'
            className='inline-flex w-full items-center gap-2 border-white/30 text-white hover:bg-white/10 sm:w-auto'
            onClick={onGuardarOffline}
          >
            <Download className='size-4 shrink-0' />
            {t('guardarOffline')}
          </AppButton>
        )}
      </div>
    </section>
  );
}
