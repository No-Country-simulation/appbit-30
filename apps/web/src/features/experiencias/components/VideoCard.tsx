'use client';

import { useTranslations } from 'next-intl';
import { Play } from 'lucide-react';

interface Props {
  title: string;
  speaker: string;
  imageUrl: string;
}

export function VideoCard({ title, speaker, imageUrl }: Props) {
  const t = useTranslations('Experiencias');

  return (
    <div className='group relative overflow-hidden rounded-[var(--radius-md)] bg-[var(--color-card)] shadow-[var(--shadow-md)]'>
      <div className='relative h-40 overflow-hidden'>
        <img
          src={imageUrl}
          alt={t(title)}
          className='h-full w-full object-cover transition-transform duration-300 group-hover:scale-105'
        />
        <div className='absolute inset-0 flex items-center justify-center bg-black/30'>
          <div className='flex size-12 items-center justify-center rounded-full bg-[var(--color-primary)] text-white shadow-lg transition-transform group-hover:scale-110'>
            <Play className='size-5 fill-current' />
          </div>
        </div>
      </div>
      <div className='p-3'>
        <h4 className='text-sm font-bold leading-tight text-[var(--color-text)]'>
          {t(title)}
        </h4>
        <p className='mt-1 text-xs text-[var(--color-text-muted)]'>{t(speaker)}</p>
      </div>
    </div>
  );
}
