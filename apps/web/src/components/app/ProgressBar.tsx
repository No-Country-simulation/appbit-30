'use client';

import { cn } from '@/lib/utils';

interface Props {
  value: number;
  className?: string;
  barClassName?: string;
}

export function ProgressBar({ value, className, barClassName }: Props) {
  const clamped = Math.max(0, Math.min(100, value));

  return (
    <div
      className={cn('h-2 w-full overflow-hidden rounded-full bg-[var(--color-border)]', className)}
      role='progressbar'
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className={cn(
          'h-full rounded-full transition-all duration-500',
          clamped >= 100 ? 'bg-[var(--color-success)]' : 'bg-[var(--color-primary)]',
          barClassName,
        )}
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}
