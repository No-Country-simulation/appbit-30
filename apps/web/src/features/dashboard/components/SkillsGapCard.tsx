'use client';

import { useTranslations } from 'next-intl';
import { AppButton } from '@/src/components/app/AppButton';
import { AppCard } from '@/src/components/app/AppCard';

interface Props {
  porcentaje?: number;
  puesto?: string;
  isLoading?: boolean;
  onVerDetalles?: () => void;
}

function CircularProgress({ value }: { value: number }) {
  const radius = 44;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div className='relative inline-flex shrink-0 items-center justify-center'>
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
  porcentaje,
  puesto,
  isLoading = false,
  onVerDetalles,
}: Props) {
  const t = useTranslations('Dashboard');

  const hasGap = typeof porcentaje === 'number';
  const resolvedPuesto = puesto ?? t('skillsGapFallbackPuesto');

  return (
    <AppCard className='flex min-w-0 flex-col items-center gap-4 text-center'>
      <h3 className='break-words font-heading text-base font-bold text-[var(--color-text)]'>
        {t('skillsGapTitle')}
      </h3>

      {isLoading ? (
        <>
          <div className='size-[104px] animate-pulse rounded-full bg-[var(--color-border)]' />
          <div className='h-4 w-48 max-w-full animate-pulse rounded bg-[var(--color-border)]' />
        </>
      ) : hasGap ? (
        <>
          <CircularProgress value={porcentaje} />

          <p className='max-w-full break-words text-sm leading-relaxed text-[var(--color-text-muted)]'>
            {t('skillsGapDesc', {
              porcentaje,
              puesto: resolvedPuesto,
            })}
          </p>

          <AppButton
            variant='outline'
            className='w-full'
            onClick={onVerDetalles}
          >
            {t('skillsGapButton')}
          </AppButton>
        </>
      ) : (
        <>
          <p className='max-w-full break-words text-sm leading-6 text-[var(--color-text-muted)]'>
            {t('skillsGapEmptyDesc')}
          </p>

          <AppButton variant='outline' className='w-full' disabled>
            {t('skillsGapButton')}
          </AppButton>
        </>
      )}
    </AppCard>
  );
}
