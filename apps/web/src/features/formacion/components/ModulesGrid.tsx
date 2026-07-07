'use client';

import { useTranslations } from 'next-intl';
import type { ReactNode } from 'react';

interface Props {
  ruta: string;
  children: ReactNode;
}

export function ModulesGrid({ ruta, children }: Props) {
  const t = useTranslations('Formacion');

  return (
    <section className='space-y-4'>
      <div>
        <h3 className='text-base font-bold text-[var(--color-text)]'>
          {t('siguientesEnTuRuta')}
        </h3>
        <p className='text-sm text-[var(--color-text-muted)]'>
          {t('ruta')}: {ruta}
        </p>
      </div>

      <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3'>
        {children}
      </div>
    </section>
  );
}
