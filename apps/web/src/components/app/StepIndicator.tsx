import { cn } from '@/lib/utils';
import { CheckIcon } from 'lucide-react';
import { Fragment } from 'react';

interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
  labels?: string[];
  className?: string;
}

export function StepIndicator({ currentStep, totalSteps, labels, className }: StepIndicatorProps) {
  const steps = Array.from({ length: totalSteps }, (_, i) => i + 1);

  return (
    <div className={cn('w-full min-w-0 overflow-hidden px-1 sm:px-3', className)}>
      <div
        className='grid w-full min-w-0'
        style={{
          gridTemplateColumns: `repeat(${totalSteps}, minmax(0, 1fr))`,
        }}
      >
        {steps.map((stepNumber, index) => {
          const isCompleted = stepNumber < currentStep;
          const isCurrent = stepNumber === currentStep;

          return (
            <Fragment key={stepNumber}>
              {index > 0 && (
                <div
                  className={cn(
                    'h-0.5 flex-1',
                    stepNumber <= currentStep
                      ? 'bg-[var(--color-primary)]'
                      : 'bg-[var(--color-text-muted)]/30',
                  )}
                />
              )}

              <div
                className={cn(
                  'relative z-10 flex size-9 shrink-0 items-center justify-center rounded-full border-2 bg-[var(--color-card)] font-body text-sm font-bold transition-colors duration-200',
                  isCompleted &&
                    'border-[var(--color-success)] bg-[var(--color-success)] text-white',
                  isCurrent &&
                    'border-[var(--color-primary)] bg-[var(--color-primary)] text-white shadow-[0_4px_14px_rgba(124,58,237,.25)]',
                  !isCompleted &&
                    !isCurrent &&
                    'border-[var(--color-border)] text-[var(--color-text-muted)]',
                )}
              >
                {isCompleted ? <CheckIcon className='size-5' /> : stepNumber}
              </div>
            </Fragment>
          );
        })}
      </div>

      <div className='flex w-full'>
        {steps.map((stepNumber, index) => {
          const isCurrent = stepNumber === currentStep;

          return (
            <div key={stepNumber} className='flex flex-1 justify-center'>
              {labels?.[index] && (
                <span
                  className={cn(
                    'mt-2 block max-w-[80px] truncate text-center font-body text-[10px] font-semibold leading-tight sm:max-w-[120px] sm:text-xs',
                    isCurrent
                      ? 'text-[var(--color-primary)]'
                      : 'text-[var(--color-text-muted)]',
                  )}
                  title={labels[index]}
                >
                  {labels[index]}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
