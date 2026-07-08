'use client';

import { useTranslations } from 'next-intl';
import { AlertTriangle } from 'lucide-react';

export function TrafficAlert() {
  const t = useTranslations('Bienestar');

  return (
    <div className='flex items-start gap-3 rounded-r-xl border-l-4 border-l-red-500 bg-red-50 p-4'>
      <AlertTriangle className='mt-0.5 size-5 shrink-0 text-red-600' />
      <div>
        <p className='text-sm font-semibold text-red-800'>{t('trafficAlertTitle')}</p>
        <p className='mt-1 text-sm text-red-700'>{t('trafficAlertDesc')}</p>
      </div>
    </div>
  );
}
