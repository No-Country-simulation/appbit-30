import { CheckIcon, PlayIcon, BookOpenIcon } from 'lucide-react';
import { AppCard } from '@/src/components/app/AppCard';
import { AppButton } from '@/src/components/app/AppButton';

interface ActionItem {
  title: string;
  priority: 'alta' | 'media' | 'baja';
  actionLabel: string;
  actionIcon: 'play' | 'book';
  completed?: boolean;
}

const defaultItems: ActionItem[] = [
  {
    title: 'SQL Avanzado',
    priority: 'alta',
    actionLabel: 'Iniciar Módulo',
    actionIcon: 'play',
  },
  {
    title: 'PowerBI / Dashboards',
    priority: 'media',
    actionLabel: 'Ver temario',
    actionIcon: 'book',
  },
  {
    title: 'Python Fundamentals',
    priority: 'baja',
    actionLabel: 'Iniciar Módulo',
    actionIcon: 'play',
  },
];

const priorityStyles = {
  alta: {
    dot: 'bg-[var(--color-danger)]',
    label: 'bg-[var(--color-danger-bg)] text-[var(--color-danger-text)]',
    text: 'Alta',
  },
  media: {
    dot: 'bg-[var(--color-secondary-dark)]',
    label: 'bg-[var(--color-secondary-pale)] text-[var(--color-warning)]',
    text: 'Media',
  },
  baja: {
    dot: 'bg-[var(--color-text-muted)]',
    label: 'bg-[var(--color-border)] text-[var(--color-text-muted)]',
    text: 'Baja',
  },
};

interface Props {
  items?: ActionItem[];
}

export function ActionPlanCard({ items = defaultItems }: Props) {
  return (
    <AppCard className='flex flex-col gap-3'>
      <h3 className='font-heading text-base font-bold text-[var(--color-text)]'>
        Plan de Acción Sugerido
      </h3>

      <ul className='space-y-3'>
        {items.map((item) => {
          const style = priorityStyles[item.priority];
          return (
            <li
              key={item.title}
              className='flex items-center justify-between gap-3 rounded-[var(--radius-md)] border border-[var(--color-border)] p-3 transition-colors hover:border-[var(--color-primary)]/30'
            >
              <div className='flex items-center gap-3'>
                <button
                  type='button'
                  className='flex size-5 shrink-0 items-center justify-center rounded-full border-2 border-[var(--color-border)] transition-colors hover:border-[var(--color-success)]'
                >
                  {item.completed && (
                    <CheckIcon className='size-3 text-[var(--color-success)]' />
                  )}
                </button>

                <div>
                  <p className='text-sm font-medium text-[var(--color-text)]'>
                    {item.title}
                  </p>
                  <span
                    className={`mt-0.5 inline-flex items-center gap-1 rounded-[var(--radius-pill)] px-2 py-0.5 text-[10px] font-semibold uppercase ${style.label}`}
                  >
                    <span className={`size-1.5 rounded-full ${style.dot}`} />
                    {style.text}
                  </span>
                </div>
              </div>

              <AppButton
                variant='outline'
                className='shrink-0 !px-3 !py-1.5 text-xs'
              >
                {item.actionIcon === 'play' ? (
                  <PlayIcon className='mr-1 size-3' />
                ) : (
                  <BookOpenIcon className='mr-1 size-3' />
                )}
                {item.actionLabel}
              </AppButton>
            </li>
          );
        })}
      </ul>
    </AppCard>
  );
}
