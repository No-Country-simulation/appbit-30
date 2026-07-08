'use client';

import { useTranslations } from 'next-intl';
import { Users } from 'lucide-react';

export function CommunityAlertBanner() {
  const t = useTranslations('Experiencias');

  return (
    <div className='flex items-start gap-3 rounded-[var(--radius-md)] bg-purple-50 p-4'>
      <div className='flex size-10 shrink-0 items-center justify-center rounded-full bg-purple-100'>
        <Users className='size-5 text-purple-600' />
      </div>
      <div>
        <h3 className='text-sm font-bold text-purple-900'>{t('communityAlertTitle')}</h3>
        <p className='mt-1 text-sm leading-relaxed text-purple-700'>{t('communityAlertDesc')}</p>
      </div>
    </div>
  );
}
