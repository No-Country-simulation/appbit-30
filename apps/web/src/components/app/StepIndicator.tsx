'use client';

import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
  labels?: string[];
  className?: string;
}

export function StepIndicator({
  currentStep,
  totalSteps,
  labels,
  className,
}: StepIndicatorProps) {
  const steps = Array.from({ length: totalSteps }, (_, index) => index + 1);

  return (
    <div
      className={cn('w-full min-w-0 overflow-hidden px-1 sm:px-3', className)}
    >
      <div
        className='grid w-full min-w-0'
        style={{
          gridTemplateColumns: `repeat(${totalSteps}, minmax(0, 1fr))`,
        }}
      >
        {steps.map((stepNumber, index) => {
          const isCompleted = stepNumber < currentStep;
          const isCurrent = stepNumber === currentStep;
          const isConnectorCompleted = stepNumber < currentStep;
          const label = labels?.[index];

          return (
            <div
              key={stepNumber}
              className='relative flex min-w-0 flex-col items-center text-center'
            >
              {index < totalSteps - 1 && (
                <div
                  className={cn(
                    'absolute left-1/2 top-[18px] z-0 h-0.5 w-full',
                    isConnectorCompleted
                      ? 'bg-[var(--color-primary)]'
                      : 'bg-[var(--color-border)]',
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
                {isCompleted ? <Check className='size-4' /> : stepNumber}
              </div>

              {label && (
                <span
                  className={cn(
                    'mt-2 block max-w-[80px] truncate text-center font-body text-[10px] font-semibold leading-tight sm:max-w-[120px] sm:text-xs',
                    isCurrent
                      ? 'text-[var(--color-primary)]'
                      : 'text-[var(--color-text-muted)]',
                  )}
                  title={label}
                >
                  {label}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
