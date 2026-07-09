'use client';

import { useTranslations } from 'next-intl';
import { AlertTriangle } from 'lucide-react';

interface Props {
  mensaje: string;
}

export function TrafficAlert({ mensaje }: Props) {
  const t = useTranslations('Bienestar');

  return (
    <div className='flex min-w-0 items-start gap-3 rounded-r-xl border-l-4 border-l-red-500 bg-red-50 p-4'>
      <AlertTriangle className='mt-0.5 size-5 shrink-0 text-red-600' />

      <div className='min-w-0'>
        <p className='break-words text-sm font-semibold text-red-800'>
          {t('trafficAlertTitle')}
        </p>

        <p className='mt-1 break-words text-sm leading-relaxed text-red-700'>
          {mensaje}
        </p>
      </div>
    </div>
  );
}
