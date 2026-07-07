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
        'inline-flex max-w-full items-center justify-center rounded-[var(--radius-pill)] px-3 py-1 text-center text-xs font-semibold leading-none whitespace-nowrap',
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
      <span className='min-w-0 truncate'>{children}</span>
    </span>
  );
}
