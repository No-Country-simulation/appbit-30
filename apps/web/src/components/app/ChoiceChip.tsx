import { cn } from '@/lib/utils';

interface ChoiceChipProps {
  label: string;
  selected: boolean;
  onClick: () => void;
}

export function ChoiceChip({ label, selected, onClick }: ChoiceChipProps) {
  return (
    <button
      type='button'
      onClick={onClick}
      className={cn(
        'rounded-[var(--radius-md)] px-4 py-2 text-sm font-medium transition-all duration-200',
        selected
          ? 'bg-[var(--color-primary)] text-white'
          : 'border border-[var(--color-border)] bg-[var(--color-card)] text-[var(--color-text)] hover:border-[var(--color-primary)] hover:bg-[var(--color-primary-pale)]',
      )}
    >
      {label}
    </button>
  );
}
