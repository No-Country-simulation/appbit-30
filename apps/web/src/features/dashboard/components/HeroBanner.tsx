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
    <section className='relative min-w-0 overflow-hidden rounded-[var(--radius-lg)] bg-[#1a1a2e] px-4 py-6 text-white sm:px-6 sm:py-7 lg:px-8 lg:py-8'>
      <div className='pointer-events-none absolute -right-16 -top-10 size-40 rounded-full bg-[#c9a84c]/75 sm:-right-14 sm:-top-16 sm:size-56 lg:-right-12 lg:size-72' />

      <div className='relative z-10 max-w-[760px]'>
        <h1 className='break-words font-heading text-2xl font-black leading-tight sm:text-3xl lg:text-4xl'>
          {t('heroBannerTitle', { nombre: resolvedNombre })}
        </h1>

        <p className='mt-3 max-w-xl break-words text-sm leading-relaxed text-white/80 sm:text-base'>
          {isLoading
            ? t('heroBannerLoadingDesc')
            : t('heroBannerDesc', {
                cursos: cursosPendientes ?? 0,
                vacantes: vacantesDisponibles ?? 0,
              })}
        </p>

        <div className='mt-5 flex min-w-0 flex-col gap-3 sm:flex-row sm:flex-wrap'>
          <AppButton className='w-full !border-[#c9a84c] !bg-[#c9a84c] !text-[#1a1a2e] hover:!bg-[#d4b85a] sm:w-auto'>
            {t('continuarRuta')}
          </AppButton>

          <AppButton
            variant='outline'
            className='w-full !border-white/30 !text-white hover:!border-white hover:!bg-white/10 sm:w-auto'
          >
            {t('verVacantes')}
          </AppButton>
        </div>
      </div>
    </section>
  );
}
