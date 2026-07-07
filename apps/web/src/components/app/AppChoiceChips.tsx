'use client';

import { cn } from '@/lib/utils';
import { useState } from 'react';
import { AppIcon } from '../icons';

type ChoiceOption = {
  label: string;
  value: string;
};

type AppChoiceChipsProps = {
  options: ChoiceOption[];
  defaultSelected?: string[];
  className?: string;
};

export function AppChoiceChips({
  options,
  defaultSelected = [],
  className,
}: AppChoiceChipsProps) {
  const [selectedValues, setSelectedValues] =
    useState<string[]>(defaultSelected);

  function toggleOption(value: string) {
    setSelectedValues((current) =>
      current.includes(value)
        ? current.filter((item) => item !== value)
        : [...current, value],
    );
  }

  return (
    <div
      className={cn(
        'flex min-w-0 max-w-full flex-wrap gap-2 sm:gap-3',
        className,
      )}
    >
      {options.map((option) => {
        const isSelected = selectedValues.includes(option.value);

        return (
          <button
            key={option.value}
            type='button'
            aria-pressed={isSelected}
            onClick={() => toggleOption(option.value)}
            className={cn(
              'inline-flex max-w-full min-w-0 items-center gap-1.5',
              'rounded-[var(--radius-pill)]',
              'border px-3 py-2 sm:px-4 sm:py-2.5',
              'font-body text-sm font-semibold leading-snug',
              'whitespace-normal break-words text-left',
              'transition-colors duration-200',
              'focus:outline-none focus:ring-3 focus:ring-[var(--color-input-focus-ring)]',
              !isSelected &&
                'border-[var(--color-border)] bg-[var(--color-card)] text-[var(--color-text)] hover:border-[var(--color-primary-light)]',
              isSelected &&
                'border-[var(--color-primary)] bg-[var(--color-primary-pale)] text-[var(--color-primary)] shadow-[0_4px_15px_rgba(124,58,237,.12)]',
            )}
          >
            {isSelected && <AppIcon name='check' className='size-4 shrink-0' />}

            <span className='min-w-0 max-w-full break-words'>
              {option.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
