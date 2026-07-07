'use client';

import { useTranslations } from 'next-intl';
import { AntennaIcon } from 'lucide-react';
import { AppButton } from '@/src/components/app/AppButton';

interface Props {
  vacantesCompatibles?: number;
  isLoading?: boolean;
}

export function RadarBanner({ vacantesCompatibles, isLoading = false }: Props) {
  const t = useTranslations('Dashboard');

  return (
    <section className='min-w-0 overflow-hidden rounded-[var(--radius-md)] bg-[#f5c542] p-4 sm:p-5'>
      <div className='flex min-w-0 flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
        <div className='flex min-w-0 items-start gap-3'>
          <div className='flex size-10 shrink-0 items-center justify-center rounded-full bg-[#c9a84c]/30'>
            <AntennaIcon className='size-5 text-[#8b6914]' />
          </div>

          <div className='min-w-0'>
            <p className='break-words text-sm font-bold leading-snug text-[#1a1a2e]'>
              {t('radarTitle')}
            </p>

            <p className='mt-1 break-words text-xs leading-relaxed text-[#1a1a2e]/75 sm:text-sm'>
              {isLoading
                ? t('radarLoadingDesc')
                : t('radarDesc', { cantidad: vacantesCompatibles ?? 0 })}
            </p>
          </div>
        </div>

        <AppButton className='w-full shrink-0 !bg-[#1a1a2e] !px-4 !py-2.5 !text-white hover:!bg-[#2a2a3e] sm:w-auto sm:max-w-[280px]'>
          {t('radarButton')}
        </AppButton>
      </div>
    </section>
  );
}
