'use client';

import { useTranslations } from 'next-intl';
import { Plus } from 'lucide-react';
import { AppCard } from '@/src/components/app/AppCard';

export function BeMentorCard() {
  const t = useTranslations('Mentoria');

  return (
    <AppCard className='flex cursor-pointer flex-col items-center justify-center gap-3 border-2 border-dashed border-violet-300 bg-violet-50 py-12 text-center transition-colors hover:border-violet-500'>
      <div className='flex size-12 items-center justify-center rounded-full bg-violet-200 text-violet-700'>
        <Plus className='size-6' />
      </div>
      <div>
        <h3 className='font-semibold text-violet-800'>{t('seUnMentor')}</h3>
        <p className='mt-1 text-sm text-violet-600'>{t('seUnMentorDesc')}</p>
      </div>
    </AppCard>
  );
}
