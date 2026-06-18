import { cn } from '@/lib/utils';
import { ButtonHTMLAttributes } from 'react';

export type ButtonVariant = 'primary' | 'outline';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
}

export function AppButton({ variant = 'primary', className, ...props }: Props) {
  return (
    <button
      {...props}
      className={cn(
        'px-6 py-3',
        'font-medium',
        'rounded-[var(--radius-md)]',
        'transition-all duration-300',
        'disabled:opacity-50',
        'disabled:pointer-events-none',

        variant === 'primary' &&
          `
          bg-[var(--color-primary)]
          text-white
          shadow-[0_4px_15px_rgba(124,58,237,.3)]
          hover:-translate-y-[2px]
          hover:bg-[var(--color-primary-dark)]
        `,

        variant === 'outline' &&
          `
          bg-transparent
          border-2
          border-[var(--color-border)]
          text-[var(--color-text)]
          hover:border-[var(--color-primary)]
        `,

        className,
      )}
    />
  );
}
