import { cn } from '@/lib/utils';
import { ButtonHTMLAttributes, forwardRef } from 'react';

export type ButtonVariant = 'primary' | 'outline';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
}

export const AppButton = forwardRef<HTMLButtonElement, Props>(
  function AppButton({ variant = 'primary', className, type, ...props }, ref) {
    return (
      <button
        ref={ref}
        type={type ?? 'button'}
        {...props}
        className={cn(
          'inline-flex min-h-10 min-w-0 items-center justify-center gap-2',
          'rounded-[var(--radius-md)] px-4 py-2.5 sm:px-6 sm:py-3',
          'text-center text-sm font-medium leading-snug',
          'whitespace-normal break-words',
          'transition-colors duration-200',
          'disabled:pointer-events-none disabled:opacity-50',

          variant === 'primary' &&
            `
            bg-[var(--color-primary)]
            text-white
            shadow-[0_4px_15px_rgba(124,58,237,.3)]
            hover:bg-[var(--color-primary-dark)]
          `,

          variant === 'outline' &&
            `
            border-2
            border-[var(--color-border)]
            bg-transparent
            text-[var(--color-text)]
            hover:border-[var(--color-primary)]
            hover:bg-[var(--color-primary-pale)]
          `,

          className,
        )}
      />
    );
  },
);
