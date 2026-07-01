'use client';

import { useTranslations } from 'next-intl';
import { AppButton } from '@/src/components/app/AppButton';
import { AppCard } from '@/src/components/app/AppCard';

interface Props {
  porcentaje?: number;
  puesto?: string;
  onVerDetalles?: () => void;
}

function CircularProgress({ value }: { value: number }) {
  const radius = 44;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div className='relative inline-flex items-center justify-center'>
      <svg width='104' height='104' className='-rotate-90'>
        <circle
          cx='52'
          cy='52'
          r={radius}
          fill='none'
          stroke='var(--color-border)'
          strokeWidth='8'
        />
        <circle
          cx='52'
          cy='52'
          r={radius}
          fill='none'
          stroke='var(--color-primary)'
          strokeWidth='8'
          strokeLinecap='round'
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className='transition-all duration-700'
        />
      </svg>
      <span className='absolute text-lg font-black text-[var(--color-primary)]'>
        {value}%
      </span>
    </div>
  );
}

export function SkillsGapCard({
  porcentaje = 40,
  puesto = 'Data Analyst Jr.',
  onVerDetalles,
}: Props) {
  const t = useTranslations('Dashboard');

  return (
    <AppCard className='flex flex-col items-center gap-4 text-center'>
      <h3 className='font-heading text-base font-bold text-[var(--color-text)]'>
        {t('skillsGapTitle')}
      </h3>

      <CircularProgress value={porcentaje} />

      <p className='text-sm text-[var(--color-text-muted)]'>
        {t('skillsGapDesc', { porcentaje, puesto })}
      </p>

      <AppButton
        variant='outline'
        className='w-full'
        onClick={onVerDetalles}
      >
        {t('skillsGapButton')}
      </AppButton>
    </AppCard>
  );
}
