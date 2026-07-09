'use client';

import { useTranslations } from 'next-intl';
import type { ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

export function PaidCoursesSection({ children }: Props) {
  const t = useTranslations('Formacion');

  return (
    <section className='space-y-4'>
      <div>
        <h3 className='text-base font-bold text-[var(--color-text)]'>
          {t('otrasOpciones')}
        </h3>
        <p className='text-sm text-[var(--color-text-muted)]'>
          {t('cursosSugeridosPago')}
        </p>
      </div>

      <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
        {children}
      </div>
    </section>
  );
}
