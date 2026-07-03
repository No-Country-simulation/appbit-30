'use client';

import { useTranslations } from 'next-intl';
import { AppButton } from '@/src/components/app/AppButton';

interface Props {
  nombre?: string;
  cursosPendientes?: number;
  vacantesDisponibles?: number;
  isLoading?: boolean;
}

export function HeroBanner({
  nombre,
  cursosPendientes,
  vacantesDisponibles,
  isLoading = false,
}: Props) {
  const t = useTranslations('Dashboard');

  const resolvedNombre = nombre || t('heroFallbackName');

  return (
    <section className='relative overflow-hidden rounded-[var(--radius-lg)] bg-[#1a1a2e] p-6 text-white sm:p-8'>
      <div className='absolute -right-16 -top-16 size-64 rounded-full bg-[#c9a84c]/80' />

      <div className='relative z-10'>
        <h1 className='font-heading text-2xl font-black sm:text-3xl'>
          {t('heroBannerTitle', { nombre: resolvedNombre })}
        </h1>

        <p className='mt-2 max-w-xl text-sm text-white/80'>
          {isLoading
            ? t('heroBannerLoadingDesc')
            : t('heroBannerDesc', {
                cursos: cursosPendientes ?? 0,
                vacantes: vacantesDisponibles ?? 0,
              })}
        </p>

        <div className='mt-5 flex flex-wrap gap-3'>
          <AppButton className='!border-[#c9a84c] !bg-[#c9a84c] !text-[#1a1a2e] hover:!bg-[#d4b85a]'>
            {t('continuarRuta')}
          </AppButton>

          <AppButton
            variant='outline'
            className='!border-white/30 !text-white hover:!border-white hover:!bg-white/10'
          >
            {t('verVacantes')}
          </AppButton>
        </div>
      </div>
    </section>
  );
}
