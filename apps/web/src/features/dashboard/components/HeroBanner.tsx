'use client';

import { AppButton } from '@/src/components/app/AppButton';

export type HeroBannerTone = 'default' | 'learning' | 'jobs' | 'wellbeing';

export interface HeroBannerAction {
  label: string;
  onClick: () => void;
  disabled?: boolean;
}

interface Props {
  title: string;
  description: string;
  tone?: HeroBannerTone;
  primaryAction: HeroBannerAction;
  secondaryAction?: HeroBannerAction;
  isLoading?: boolean;
  isRefreshing?: boolean;
  refreshingLabel?: string;
}

const toneClasses: Record<
  HeroBannerTone,
  {
    background: string;
    orb: string;
    primary: string;
  }
> = {
  default: {
    background: 'bg-[#1a1a2e]',
    orb: 'bg-[#c9a84c]/75',
    primary:
      '!border-[#c9a84c] !bg-[#c9a84c] !text-[#1a1a2e] hover:!bg-[#d4b85a]',
  },
  learning: {
    background: 'bg-[#1a1a2e]',
    orb: 'bg-[#c9a84c]/75',
    primary:
      '!border-[#c9a84c] !bg-[#c9a84c] !text-[#1a1a2e] hover:!bg-[#d4b85a]',
  },
  jobs: {
    background: 'bg-[#12342b]',
    orb: 'bg-[var(--color-success)]/60',
    primary:
      '!border-[var(--color-success)] !bg-[var(--color-success)] !text-white hover:!opacity-90',
  },
  wellbeing: {
    background: 'bg-[#3a1f2d]',
    orb: 'bg-[var(--color-danger)]/45',
    primary: '!border-white !bg-white !text-[#3a1f2d] hover:!bg-white/90',
  },
};

export function HeroBanner({
  title,
  description,
  tone = 'default',
  primaryAction,
  secondaryAction,
  isLoading = false,
  isRefreshing = false,
  refreshingLabel,
}: Props) {
  const classes = toneClasses[tone];

  return (
    <section
      aria-busy={isLoading || isRefreshing}
      className={`relative min-w-0 overflow-hidden rounded-[var(--radius-lg)] px-4 py-6 text-white sm:px-6 sm:py-7 lg:px-8 lg:py-8 ${classes.background}`}
    >
      <div
        className={`pointer-events-none absolute -right-16 -top-10 size-40 rounded-full sm:-right-14 sm:-top-16 sm:size-56 lg:-right-12 lg:size-72 ${classes.orb}`}
      />

      <div className='relative z-10 max-w-[760px]'>
        {isLoading ? (
          <div className='space-y-3'>
            <div className='h-9 w-3/4 animate-pulse rounded-full bg-white/20 sm:h-10' />
            <div className='h-4 w-full max-w-xl animate-pulse rounded-full bg-white/15' />
            <div className='h-4 w-2/3 animate-pulse rounded-full bg-white/15' />
          </div>
        ) : (
          <>
            <div className='flex min-w-0 items-start gap-3'>
              <h1 className='min-w-0 break-words font-heading text-2xl font-black leading-tight sm:text-3xl lg:text-4xl'>
                {title}
              </h1>

              {isRefreshing && refreshingLabel && (
              <span className='mt-1 shrink-0 rounded-full bg-white/10 px-2 py-1 text-xs font-semibold text-white/75'>
                {refreshingLabel}
              </span>
               )}
            </div>

            <p className='mt-3 max-w-xl break-words text-sm leading-relaxed text-white/80 sm:text-base'>
              {description}
            </p>
          </>
        )}

        <div className='mt-5 flex min-w-0 flex-col gap-3 sm:flex-row sm:flex-wrap'>
          <AppButton
            type='button'
            disabled={isLoading || primaryAction.disabled}
            onClick={primaryAction.onClick}
            className={`w-full sm:w-auto ${classes.primary}`}
          >
            {primaryAction.label}
          </AppButton>

          {secondaryAction && (
            <AppButton
              type='button'
              variant='outline'
              disabled={isLoading || secondaryAction.disabled}
              onClick={secondaryAction.onClick}
              className='w-full !border-white/30 !text-white hover:!border-white hover:!bg-white/10 sm:w-auto'
            >
              {secondaryAction.label}
            </AppButton>
          )}
        </div>
      </div>
    </section>
  );
}
