import { cn } from '@/lib/utils';

interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
}

export function StepIndicator({ currentStep, totalSteps }: StepIndicatorProps) {
  return (
    <div className='flex items-center justify-center gap-0'>
      {Array.from({ length: totalSteps }, (_, i) => {
        const step = i + 1;
        const isCompleted = step < currentStep;
        const isActive = step === currentStep;

        return (
          <div key={step} className='flex items-center'>
            <div
              className={cn(
                'flex size-8 items-center justify-center rounded-[var(--radius-pill)] text-sm font-semibold transition-all duration-300',
                isCompleted &&
                  'bg-[var(--color-primary)] text-white',
                isActive &&
                  'border-2 border-[var(--color-primary)] bg-transparent text-[var(--color-primary)]',
                !isCompleted && !isActive &&
                  'border-2 border-[var(--color-text-muted)]/30 bg-transparent text-[var(--color-text-muted)]/50',
              )}
            >
              {isCompleted ? (
                <svg className='size-4' viewBox='0 0 16 16' fill='none'>
                  <path
                    d='M3 8.5L6.5 12L13 4'
                    stroke='white'
                    strokeWidth='2'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                  />
                </svg>
              ) : (
                step
              )}
            </div>

            {step < totalSteps && (
              <div
                className={cn(
                  'mx-1 h-0.5 w-10 transition-all duration-300 sm:w-16',
                  isCompleted
                    ? 'bg-[var(--color-primary)]'
                    : 'bg-[var(--color-text-muted)]/30',
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
