import { CheckCircleIcon, PlayIcon, BookOpenIcon } from 'lucide-react';
import { AppCard } from '@/src/components/app/AppCard';
import { AppButton } from '@/src/components/app/AppButton';

interface ActionItem {
  title: string;
  priority: 'alta' | 'media' | 'completado';
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
    priority: 'completado',
    actionLabel: 'Iniciar Módulo',
    actionIcon: 'play',
    completed: true,
  },
];

const priorityStyles = {
  alta: { color: 'text-[var(--color-danger)]', label: 'Alta prioridad' },
  media: { color: 'text-[var(--color-warning)]', label: 'Media prioridad' },
  completado: {
    color: 'text-[var(--color-success)]',
    label: 'Completado',
  },
};

interface Props {
  items?: ActionItem[];
}

export function ActionPlanCard({ items = defaultItems }: Props) {
  return (
    <AppCard className='flex flex-col'>
      <h3 className='font-heading text-base font-bold text-[var(--color-text)]'>
        Plan de Acción Sugerido
      </h3>

      <ul className='mt-4 flex flex-col'>
        {items.map((item, index) => {
          const style = priorityStyles[item.priority];
          return (
            <li
              key={item.title}
              className={`flex items-center justify-between gap-4 py-4 ${
                index < items.length - 1
                  ? 'border-b border-[var(--color-border)]'
                  : ''
              }`}
            >
              <div className='flex flex-col gap-1'>
                <div className='flex items-center gap-2'>
                  <p className='text-sm font-bold text-[var(--color-text)]'>
                    {item.title}
                  </p>
                  {item.completed && (
                    <CheckCircleIcon className='size-4 text-[var(--color-success)]' />
                  )}
                </div>
                <span className={`text-xs font-medium ${style.color}`}>
                  {style.label}
                </span>
              </div>

              {!item.completed && (
                <AppButton
                  variant={item.actionIcon === 'play' ? 'primary' : 'outline'}
                  className='shrink-0 !px-3 !py-1.5 text-xs'
                >
                  {item.actionIcon === 'play' ? (
                    <PlayIcon className='mr-1 size-3' />
                  ) : (
                    <BookOpenIcon className='mr-1 size-3' />
                  )}
                  {item.actionLabel}
                </AppButton>
              )}
            </li>
          );
        })}
      </ul>
    </AppCard>
  );
}
