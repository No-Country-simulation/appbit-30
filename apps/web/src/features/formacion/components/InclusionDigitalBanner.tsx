'use client';

import { useTranslations } from 'next-intl';
import { WifiOff } from 'lucide-react';

export function InclusionDigitalBanner() {
  const t = useTranslations('Formacion');

  return (
    <div className='flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4'>
      <WifiOff className='mt-0.5 size-5 shrink-0 text-amber-600' />
      <div>
        <p className='text-sm font-semibold text-amber-800'>
          {t('inclusionDigitalTitle')}
        </p>
        <p className='mt-1 text-sm text-amber-700'>
          {t('inclusionDigitalDesc')}
        </p>
      </div>
    </div>
  );
}
