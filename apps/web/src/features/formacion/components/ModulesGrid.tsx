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
    <section className='min-w-0 space-y-4'>
      <div className='min-w-0'>
        <h3 className='break-words text-base font-bold text-[var(--color-text)]'>
          {t('siguientesEnTuRuta')}
        </h3>

        <p className='mt-0.5 break-words text-sm text-[var(--color-text-muted)]'>
          {t('ruta')}: {ruta}
        </p>
      </div>

      <div className='grid min-w-0 grid-cols-1 gap-4 sm:[grid-template-columns:repeat(auto-fit,minmax(min(100%,18rem),22rem))]'>
        {children}
      </div>
    </section>
  );
}
