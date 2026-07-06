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
        'min-w-0 overflow-hidden rounded-[var(--radius-md)] bg-[var(--color-card)] p-4 shadow-[var(--shadow-md)] sm:p-6',
        hover &&
          'transition-shadow duration-300 hover:shadow-[var(--shadow-lg)]',
        className,
      )}
    >
      {children}
    </div>
  );
}
