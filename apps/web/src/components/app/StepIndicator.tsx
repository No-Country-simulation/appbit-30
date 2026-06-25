import { cn } from '@/lib/utils';
import { CheckIcon } from 'lucide-react';
import { Fragment } from 'react';

interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
  labels?: string[];
}

export function StepIndicator({ currentStep, totalSteps, labels }: StepIndicatorProps) {
  return (
    <div className='flex w-full flex-col'>
      <div className='flex w-full items-center'>
        {Array.from({ length: totalSteps }, (_, i) => {
          const step = i + 1;
          const isCompleted = step < currentStep;
          const isActive = step === currentStep;

          return (
            <Fragment key={step}>
              {i > 0 && (
                <div
                  className={cn(
                    'h-0.5 flex-1',
                    step <= currentStep
                      ? 'bg-[var(--color-primary)]'
                      : 'bg-[var(--color-text-muted)]/30',
                  )}
                />
              )}

              <div
                className={cn(
                  'flex size-10 shrink-0 items-center justify-center rounded-[var(--radius-pill)] text-sm font-semibold transition-all duration-300',
                  isCompleted && 'bg-[var(--color-success)] text-white',
                  isActive && 'bg-[var(--color-primary)] text-white',
                  !isCompleted && !isActive &&
                    'border-2 border-[var(--color-text-muted)]/30 bg-transparent text-[var(--color-text-muted)]',
                )}
              >
                {isCompleted ? <CheckIcon className='size-5' /> : step}
              </div>
            </Fragment>
          );
        })}
      </div>

      <div className='flex w-full'>
        {Array.from({ length: totalSteps }, (_, i) => {
          const step = i + 1;
          const isActive = step === currentStep;

          return (
            <div key={step} className='flex flex-1 justify-center'>
              {labels?.[i] && (
                <span
                  className={cn(
                    'mt-2 text-xs font-medium transition-colors',
                    isActive ? 'text-[var(--color-primary)]' : 'text-[var(--color-text-muted)]',
                  )}
                >
                  {labels[i]}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
