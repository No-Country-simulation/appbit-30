import { cn } from '@/lib/utils';

interface Props {
  children: React.ReactNode;
  hover?: boolean;
  className?: string;
}

export function AppCard({ children, hover = false, className }: Props) {
  return (
    <div
      className={cn(
        'bg-[var(--color-card)]',
        'p-6',
        'rounded-[var(--radius-md)]',
        'shadow-[var(--shadow-md)]',
        hover &&
          'transition-all duration-300 hover:-translate-y-[5px] hover:shadow-[var(--shadow-lg)]',
        className,
      )}
    >
      {children}
    </div>
  );
}
