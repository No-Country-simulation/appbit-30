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
    <AppCard className='flex flex-col gap-3'>
      <div>
        <div className='flex items-center justify-between'>
          <h4 className='font-semibold text-[var(--color-text)]'>{titulo}</h4>
          <span className='rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-700'>
            {plataforma}
          </span>
        </div>
        <p className='mt-1 text-sm text-[var(--color-text-muted)]'>{descripcion}</p>
      </div>

      <AppButton variant='outline' onClick={onVerDetalles}>
        {t('verDetalles')}
      </AppButton>
    </AppCard>
  );
}
