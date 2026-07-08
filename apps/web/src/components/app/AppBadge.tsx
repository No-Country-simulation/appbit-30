import { cn } from '@/lib/utils';

type Variant = 'primary' | 'success' | 'danger' | 'warning';

interface Props {
  children: React.ReactNode;
  variant?: Variant;
  className?: string;
}

export function AppBadge({ children, variant = 'primary', className }: Props) {
  return (
    <span
      className={cn(
        'inline-flex w-fit max-w-full shrink-0 items-center justify-center',
        'rounded-[var(--radius-pill)] px-2.5 py-1 sm:px-3',
        'text-center text-xs font-semibold leading-tight',
        'whitespace-nowrap',
        variant === 'primary' &&
          'bg-[var(--color-primary-pale)] text-[var(--color-primary)]',
        variant === 'success' &&
          'bg-[var(--color-success-bg)] text-[var(--color-success-text)]',
        variant === 'danger' &&
          'bg-[var(--color-danger-bg)] text-[var(--color-danger-text)]',
        variant === 'warning' &&
          'bg-[var(--color-secondary-pale)] text-[var(--color-warning)]',
        className,
      )}
    >
      {children}
    </span>
  );
}
