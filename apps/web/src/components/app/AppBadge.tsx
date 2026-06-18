import { cn } from '@/lib/utils';

type Variant = 'primary' | 'success' | 'danger' | 'warning';

interface Props {
  children: React.ReactNode;
  variant?: Variant;
}

export function AppBadge({ children, variant = 'primary' }: Props) {
  return (
    <span
      className={cn(
        'px-3 py-1',
        'text-xs font-semibold',
        'rounded-[var(--radius-pill)]',

        variant === 'primary' &&
          'bg-[var(--color-primary-pale)] text-[var(--color-primary)]',

        variant === 'success' &&
          'bg-[var(--color-success-bg)] text-[var(--color-success-text)]',

        variant === 'danger' &&
          'bg-[var(--color-danger-bg)] text-[var(--color-danger-text)]',

        variant === 'warning' &&
          'bg-[var(--color-secondary-pale)] text-[var(--color-warning)]',
      )}
    >
      {children}
    </span>
  );
}
