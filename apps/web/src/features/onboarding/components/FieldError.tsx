'use client';

import { useTranslations } from 'next-intl';
import { Caption } from '@/src/components/typography';
import { AlertCircleIcon } from 'lucide-react';

export function FieldError({ show }: { show: boolean }) {
  const t = useTranslations('Onboarding');

  if (!show) return null;

  return (
    <Caption className='mt-1 flex items-center gap-1 text-[var(--color-danger)]'>
      <AlertCircleIcon className='size-3 shrink-0' />
      {t('fieldRequired')}
    </Caption>
  );
}
