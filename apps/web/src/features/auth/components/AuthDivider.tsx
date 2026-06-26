'use client';

import { useTranslations } from 'next-intl';

export function AuthDivider() {
  const t = useTranslations('Auth');

  return (
    <div className='flex items-center gap-3'>
      <div className='h-px flex-1 bg-[var(--color-border)]' />

      <span className='font-body text-xs font-medium text-[var(--color-text-muted)]'>
        {t('divider')}
      </span>

      <div className='h-px flex-1 bg-[var(--color-border)]' />
    </div>
  );
}
