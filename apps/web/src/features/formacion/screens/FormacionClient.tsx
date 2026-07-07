'use client';

import { useTranslations } from 'next-intl';
import { AppShell } from '@/src/components/layout/AppShell';

export default function FormacionClient() {
  const t = useTranslations('Formacion');

  return (
    <AppShell>
      <div className='space-y-6'>
        <h1 className='text-2xl font-bold text-[var(--color-text)]'>
          {t('title')}
        </h1>
      </div>
    </AppShell>
  );
}
