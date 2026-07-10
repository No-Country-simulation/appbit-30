'use client';

import { useTranslations } from 'next-intl';
import { Plus } from 'lucide-react';

interface Props {
  onClick: () => void;
}

export function BeMentorCard({ onClick }: Props) {
  const t = useTranslations('Mentoria');

  return (
    <button
      type='button'
      onClick={onClick}
      className='flex min-h-[22rem] w-full min-w-0 cursor-pointer flex-col items-center justify-center gap-3 rounded-[var(--radius-md)] border-2 border-dashed border-violet-300 bg-violet-50 p-6 text-center transition-colors hover:border-violet-500'
    >
      <div className='flex size-12 shrink-0 items-center justify-center rounded-full bg-violet-200 text-violet-700'>
        <Plus className='size-6' />
      </div>

      <div className='min-w-0'>
        <h3 className='break-words font-semibold text-violet-800'>
          {t('seUnMentor')}
        </h3>

        <p className='mt-1 break-words text-sm leading-relaxed text-violet-600'>
          {t('seUnMentorDesc')}
        </p>
      </div>
    </button>
  );
}
