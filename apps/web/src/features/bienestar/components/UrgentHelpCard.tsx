'use client';

import { useTranslations } from 'next-intl';
import { Phone } from 'lucide-react';
import { AppCard } from '@/src/components/app/AppCard';
import { AppButton } from '@/src/components/app/AppButton';

export function UrgentHelpCard() {
  const t = useTranslations('Bienestar');

  return (
    <AppCard className='min-w-0 space-y-3 border-2 border-red-200 bg-red-50'>
      <div className='flex min-w-0 items-center gap-2'>
        <Phone className='size-5 shrink-0 text-red-600' />

        <h3 className='break-words text-sm font-bold text-red-800'>
          {t('ayudaUrgente')}
        </h3>
      </div>

      <p className='break-words text-sm leading-relaxed text-red-700'>
        {t('ayudaUrgenteDesc')}
      </p>

      <AppButton
        variant='primary'
        className='w-full bg-red-600 text-white shadow-none hover:bg-red-700'
        onClick={() => {
          window.location.href = 'tel:188';
        }}
      >
        {t('llamar')}
      </AppButton>
    </AppCard>
  );
}
