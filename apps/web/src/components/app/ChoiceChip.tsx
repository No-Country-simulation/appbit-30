import { cn } from '@/lib/utils';
import { CheckIcon } from 'lucide-react';

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
        'flex items-center gap-1.5 rounded-[var(--radius-pill)] px-4 py-2 text-sm font-medium transition-all duration-200',
        selected
          ? 'border-2 border-[var(--color-primary)] bg-[var(--color-primary-pale)] text-[var(--color-primary)]'
          : 'border border-[var(--color-border)] bg-[var(--color-card)] text-[var(--color-text)] hover:border-[var(--color-primary)] hover:bg-[var(--color-primary-pale)]',
      )}
    >
      {selected && <CheckIcon className='size-4' />}
      {label}
    </button>
  );
}
