'use client';

import { useTranslations } from 'next-intl';
import { AppCard } from '@/src/components/app/AppCard';
import { AppButton } from '@/src/components/app/AppButton';

interface Props {
  titulo: string;
  plataforma: string;
  descripcion: string;
  onVerDetalles: () => void;
}

export function PaidCourseCard({
  titulo,
  plataforma,
  descripcion,
  onVerDetalles,
}: Props) {
  const t = useTranslations('Formacion');

  return (
    <AppCard className='flex min-w-0 flex-col gap-4'>
      <div className='min-w-0'>
        <div className='flex min-w-0 flex-col gap-2 sm:flex-row sm:items-start sm:justify-between'>
          <h4 className='min-w-0 break-words font-semibold leading-tight text-[var(--color-text)]'>
            {titulo}
          </h4>

          <span className='w-fit shrink-0 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-700'>
            {plataforma}
          </span>
        </div>

        <p className='mt-2 min-w-0 break-words text-sm leading-relaxed text-[var(--color-text-muted)]'>
          {descripcion}
        </p>
      </div>

      <AppButton
        variant='outline'
        className='w-full sm:w-auto'
        onClick={onVerDetalles}
      >
        {t('verDetalles')}
      </AppButton>
    </AppCard>
  );
}
