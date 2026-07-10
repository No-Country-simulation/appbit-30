'use client';

import { useTranslations } from 'next-intl';
import { Video } from 'lucide-react';
import { AppButton } from '@/src/components/app/AppButton';
import { AppBadge } from '@/src/components/app/AppBadge';

export function LiveEventHero() {
  const t = useTranslations('Experiencias');

  return (
    <section className='relative min-w-0 overflow-hidden rounded-[var(--radius-md)] bg-gradient-to-br from-gray-900 to-gray-800 p-4 text-white sm:p-6'>
      <div
        className='absolute inset-0 opacity-20'
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=400&fit=crop')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />

      <div className='relative min-w-0'>
        <AppBadge className='mb-3 bg-red-500/20 text-red-300'>
          {t('liveBadge')}
        </AppBadge>

        <h2 className='max-w-2xl break-words text-xl font-bold leading-tight sm:text-2xl'>
          {t('heroTitle')}
        </h2>

        <p className='mt-2 max-w-2xl break-words text-sm leading-relaxed text-gray-300'>
          {t('heroSpeaker')}
        </p>

        <AppButton
          variant='primary'
          className='mt-4 w-full bg-white text-gray-900 shadow-none hover:bg-gray-100 sm:w-auto'
        >
          <Video className='size-4 shrink-0' />
          {t('joinNow')}
        </AppButton>
      </div>
    </section>
  );
}
