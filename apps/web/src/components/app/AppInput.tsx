import { cn } from '@/lib/utils';
import { InputHTMLAttributes } from 'react';

export function AppInput({
  className,
  type,
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      type={type}
      {...props}
      className={cn(
        'block h-11 w-full min-w-0 max-w-full appearance-none',
        'rounded-[8px] border border-[var(--color-input-border)]',
        'bg-[var(--color-card)] px-3 py-2',
        'font-body text-base leading-tight text-[var(--color-text)] sm:text-sm',
        'outline-none transition-colors duration-200',
        'focus:border-[var(--color-primary)] focus:ring-[3px] focus:ring-[var(--color-input-focus-ring)]',
        type === 'date' &&
          '[&::-webkit-calendar-picker-indicator]:ml-auto [&::-webkit-date-and-time-value]:min-h-[1.25rem]',
        className,
      )}
    />
  );
}
