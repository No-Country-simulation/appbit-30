'use client';

import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';

interface Props {
  categories: readonly { id: string; labelKey: string }[];
  active: string;
  onChange: (id: string) => void;
}

export function EventCategoryTabs({ categories, active, onChange }: Props) {
  const t = useTranslations('Experiencias');

  return (
    <div className='flex flex-wrap gap-2'>
      {categories.map((cat) => (
        <button
          key={cat.id}
          onClick={() => onChange(cat.id)}
          className={cn(
            'rounded-[var(--radius-pill)] px-4 py-2 text-sm font-semibold transition-colors',
            active === cat.id
              ? 'bg-[var(--color-primary)] text-white'
              : 'bg-[var(--color-primary-pale)] text-[var(--color-primary)] hover:bg-[var(--color-primary)]/20',
          )}
        >
          {t(cat.labelKey)}
        </button>
      ))}
    </div>
  );
}
