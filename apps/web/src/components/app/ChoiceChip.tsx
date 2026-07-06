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
      aria-pressed={selected}
      onClick={onClick}
      className={cn(
        'inline-flex max-w-full min-w-0 items-center gap-1.5 rounded-[var(--radius-pill)] px-3 py-2 text-left text-sm font-medium leading-snug transition-colors duration-200 sm:px-4',
        'whitespace-normal break-words',
        selected
          ? 'border-2 border-[var(--color-primary)] bg-[var(--color-primary-pale)] text-[var(--color-primary)]'
          : 'border border-[var(--color-border)] bg-[var(--color-card)] text-[var(--color-text)] hover:border-[var(--color-primary)] hover:bg-[var(--color-primary-pale)]',
      )}
    >
      {selected && <CheckIcon className='size-4 shrink-0' />}

      <span className='min-w-0 max-w-full break-words'>{label}</span>
    </button>
  );
}
