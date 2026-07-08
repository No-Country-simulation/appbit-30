'use client';

import { useTranslations } from 'next-intl';
import { Phone } from 'lucide-react';
import { AppCard } from '@/src/components/app/AppCard';
import { AppButton } from '@/src/components/app/AppButton';

export function UrgentHelpCard() {
  const t = useTranslations('Bienestar');

  return (
    <AppCard className='border-2 border-red-200 bg-red-50 space-y-3'>
      <div className='flex items-center gap-2'>
        <Phone className='size-5 text-red-600' />
        <h3 className='text-sm font-bold text-red-800'>{t('ayudaUrgente')}</h3>
      </div>

      <p className='text-sm leading-relaxed text-red-700'>{t('ayudaUrgenteDesc')}</p>

      <AppButton
        variant='primary'
        className='w-full bg-red-600 text-white hover:bg-red-700 shadow-none'
        onClick={() => alert(t('lineaApoyo'))}
      >
        {t('llamar')}
      </AppButton>
    </AppCard>
  );
}
