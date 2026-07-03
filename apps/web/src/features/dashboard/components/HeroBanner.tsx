'use client';

import { useTranslations } from 'next-intl';
import { AppButton } from '@/src/components/app/AppButton';

interface Props {
  nombre?: string;
  cursosPendientes?: number;
  vacantesDisponibles?: number;
}

export function HeroBanner({
  nombre = 'María',
  cursosPendientes = 2,
  vacantesDisponibles = 12,
}: Props) {
  const t = useTranslations('Dashboard');

  return (
    <section className='relative overflow-hidden rounded-[var(--radius-lg)] bg-[#1a1a2e] p-6 text-white sm:p-8'>
      <div className='absolute -right-16 -top-16 size-64 rounded-full bg-[#c9a84c]/80' />

      <div className='relative z-10'>
        <h1 className='font-heading text-2xl font-black sm:text-3xl'>
          {t('heroBannerTitle', { nombre })}
        </h1>

        <p className='mt-2 max-w-xl text-sm text-white/80'>
          {t('heroBannerDesc', { cursos: cursosPendientes, vacantes: vacantesDisponibles })}
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
