import { cn } from '@/lib/utils';
import { InputHTMLAttributes } from 'react';

export function AppInput({
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={cn(
        `
        w-full
        px-4
        py-[14px]

        rounded-[8px]

        border
        border-[var(--color-input-border)]

        bg-[var(--color-card)]
        text-[var(--color-text)]

        outline-none

        transition-all
        duration-300

        focus:border-[var(--color-primary)]
        focus:ring-[3px]
        focus:ring-[var(--color-input-focus-ring)]
      `,
        className,
      )}
    />
  );
}
