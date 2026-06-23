import { cn } from '@/lib/utils';
import { CheckIcon } from 'lucide-react';

interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
  labels?: string[];
}

export function StepIndicator({ currentStep, totalSteps, labels }: StepIndicatorProps) {
  return (
    <div className='flex items-start justify-center gap-0'>
      {Array.from({ length: totalSteps }, (_, i) => {
        const step = i + 1;
        const isCompleted = step < currentStep;
        const isActive = step === currentStep;

        return (
          <div key={step} className='flex flex-col items-center'>
            <div className='flex items-center'>
              <div
                className={cn(
                  'flex size-10 items-center justify-center rounded-[var(--radius-pill)] text-sm font-semibold transition-all duration-300',
                  isCompleted && 'bg-[var(--color-success)] text-white',
                  isActive && 'bg-[var(--color-primary)] text-white',
                  !isCompleted && !isActive &&
                    'border-2 border-[var(--color-text-muted)]/30 bg-transparent text-[var(--color-text-muted)]',
                )}
              >
                {isCompleted ? <CheckIcon className='size-5' /> : step}
              </div>

              {step < totalSteps && (
                <div
                  className={cn(
                    'mx-1 h-0.5 w-10 transition-all duration-300 sm:w-16',
                    isCompleted ? 'bg-[var(--color-success)]' : 'bg-[var(--color-text-muted)]/30',
                  )}
                />
              )}
            </div>

            {labels?.[i] && (
              <span
                className={cn(
                  'mt-2 text-xs font-medium transition-colors',
                  isActive || isCompleted ? 'text-[var(--color-primary)]' : 'text-[var(--color-text-muted)]',
                )}
              >
                {labels[i]}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}
