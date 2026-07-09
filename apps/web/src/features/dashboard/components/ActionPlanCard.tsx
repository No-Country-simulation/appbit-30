'use client';

import { useTranslations } from 'next-intl';
import {
  CheckCircleIcon,
  PlayIcon,
  BookOpenIcon,
  ExternalLinkIcon,
} from 'lucide-react';
import { AppCard } from '@/src/components/app/AppCard';
import { AppButton } from '@/src/components/app/AppButton';

export interface ActionItem {
  id?: string;
  title: string;
  priority: 'alta' | 'media' | 'completado';
  actionLabel: string;
  actionIcon: 'play' | 'book' | 'external';
  completed?: boolean;
  curso?: {
    curso_id?: string | null;
    titulo?: string | null;
    url_externa?: string | null;
    plataforma?: string | null;
    tipo?: string | null;
    hasInternalContent?: boolean | null;
  } | null;
}

interface Props {
  items?: ActionItem[];
  isLoading?: boolean;
  onItemClick?: (item: ActionItem) => void;
}

export function ActionPlanCard({
  items = [],
  isLoading = false,
  onItemClick,
}: Props) {
  const t = useTranslations('Dashboard');

  const priorityStyles = {
    alta: { color: 'text-[var(--color-danger)]', label: t('altaPrioridad') },
    media: { color: 'text-[var(--color-warning)]', label: t('mediaPrioridad') },
    completado: {
      color: 'text-[var(--color-success)]',
      label: t('completado'),
    },
  };

  function getButtonVariant(item: ActionItem) {
    if (item.actionIcon === 'book') {
      return 'outline';
    }

    return 'primary';
  }

  function getActionIcon(item: ActionItem) {
    if (item.actionIcon === 'play') {
      return <PlayIcon className='size-3.5 shrink-0' />;
    }

    if (item.actionIcon === 'external') {
      return <ExternalLinkIcon className='size-3.5 shrink-0' />;
    }

    return <BookOpenIcon className='size-3.5 shrink-0' />;
  }

  return (
    <AppCard className='flex min-w-0 flex-col'>
      <h3 className='break-words font-heading text-base font-bold text-[var(--color-text)]'>
        {t('actionPlanTitle')}
      </h3>

      {isLoading ? (
        <div className='mt-4 flex flex-col'>
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className='grid grid-cols-1 gap-3 border-b border-[var(--color-border)] py-4 last:border-b-0 sm:grid-cols-[minmax(0,1fr)_160px] sm:items-center'
            >
              <div className='flex min-w-0 flex-col gap-2'>
                <div className='h-4 w-40 max-w-full animate-pulse rounded bg-[var(--color-border)]' />
                <div className='h-3 w-24 max-w-full animate-pulse rounded bg-[var(--color-border)]' />
              </div>

              <div className='h-9 w-full animate-pulse rounded-[var(--radius-md)] bg-[var(--color-border)]' />
            </div>
          ))}
        </div>
      ) : items.length === 0 ? (
        <p className='mt-4 break-words font-body text-sm leading-6 text-[var(--color-text-muted)]'>
          {t('actionPlanEmpty')}
        </p>
      ) : (
        <ul className='mt-4 flex min-w-0 flex-col'>
          {items.map((item, index) => {
            const style = priorityStyles[item.priority];

            return (
              <li
                key={`${item.id ?? item.title}-${index}`}
                className={`grid min-w-0 grid-cols-1 gap-3 py-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center ${
                  index < items.length - 1
                    ? 'border-b border-[var(--color-border)]'
                    : ''
                }`}
              >
                <div className='min-w-0'>
                  <div className='flex min-w-0 items-start gap-2'>
                    <p className='min-w-0 break-words text-sm font-bold leading-snug text-[var(--color-text)]'>
                      {item.title}
                    </p>

                    {item.completed && (
                      <CheckCircleIcon className='mt-0.5 size-4 shrink-0 text-[var(--color-success)]' />
                    )}
                  </div>

                  <span
                    className={`mt-1 block text-xs font-medium ${style.color}`}
                  >
                    {style.label}
                  </span>
                </div>

                {!item.completed && (
                  <AppButton
                    variant={getButtonVariant(item)}
                    className='w-full min-w-0 !justify-center !gap-1.5 !px-3 !py-2 text-xs sm:w-auto sm:max-w-[240px]'
                    onClick={() => onItemClick?.(item)}
                  >
                    {getActionIcon(item)}

                    <span className='min-w-0 break-words leading-snug'>
                      {item.actionLabel}
                    </span>
                  </AppButton>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </AppCard>
  );
}
