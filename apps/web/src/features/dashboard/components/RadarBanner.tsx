'use client';

import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { AntennaIcon } from 'lucide-react';
import { AppButton } from '@/src/components/app/AppButton';

interface Props {
  vacantesCompatibles?: number;
}

export function RadarBanner({ vacantesCompatibles = 5 }: Props) {
  const t = useTranslations('Dashboard');
  const router = useRouter();

  return (
    <section className='flex items-center justify-between gap-4 rounded-[var(--radius-md)] bg-[#f5c542] p-4 sm:px-6'>
      <div className='flex items-center gap-3'>
        <div className='flex size-10 shrink-0 items-center justify-center rounded-full bg-[#c9a84c]/30'>
          <AntennaIcon className='size-5 text-[#8b6914]' />
        </div>
        <div>
          <p className='text-sm font-bold text-[#1a1a2e]'>
            {t('radarTitle')}
          </p>
          <p className='text-xs text-[#1a1a2e]/70'>
            {t('radarDesc', { cantidad: vacantesCompatibles })}
          </p>
        </div>
      </div>

      <AppButton
        className='shrink-0 !bg-[#1a1a2e] !text-white hover:!bg-[#2a2a3e]'
        onClick={() => router.push('/empleabilidad')}
      >
        {t('radarButton')}
      </AppButton>
    </section>
  );
}
