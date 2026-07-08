'use client';

import { useTranslations } from 'next-intl';
import { Video } from 'lucide-react';
import { AppButton } from '@/src/components/app/AppButton';
import { AppBadge } from '@/src/components/app/AppBadge';

export function LiveEventHero() {
  const t = useTranslations('Experiencias');

  return (
    <div className='relative overflow-hidden rounded-[var(--radius-md)] bg-gradient-to-br from-gray-900 to-gray-800 p-6 text-white'>
      <div
        className='absolute inset-0 opacity-20'
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=400&fit=crop')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />
      <div className='relative'>
        <AppBadge className='mb-3 bg-red-500/20 text-red-300'>
          {t('liveBadge')}
        </AppBadge>
        <h2 className='text-xl font-bold leading-tight'>{t('heroTitle')}</h2>
        <p className='mt-2 text-sm text-gray-300'>{t('heroSpeaker')}</p>
        <AppButton
          variant='primary'
          className='mt-4 bg-white text-gray-900 hover:bg-gray-100 shadow-none'
        >
          <Video className='mr-2 size-4' />
          {t('joinNow')}
        </AppButton>
      </div>
    </div>
  );
}
