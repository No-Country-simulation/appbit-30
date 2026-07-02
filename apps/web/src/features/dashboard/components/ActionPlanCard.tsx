'use client';

import { useTranslations } from 'next-intl';
import { CheckCircleIcon, PlayIcon, BookOpenIcon } from 'lucide-react';
import { AppCard } from '@/src/components/app/AppCard';
import { AppButton } from '@/src/components/app/AppButton';

export interface ActionItem {
  title: string;
  priority: 'alta' | 'media' | 'completado';
  actionLabel: string;
  actionIcon: 'play' | 'book';
  completed?: boolean;
}

interface Props {
  items?: ActionItem[];
  isLoading?: boolean;
}

export function ActionPlanCard({ items = [], isLoading = false }: Props) {
  const t = useTranslations('Dashboard');

  const priorityStyles = {
    alta: { color: 'text-[var(--color-danger)]', label: t('altaPrioridad') },
    media: { color: 'text-[var(--color-warning)]', label: t('mediaPrioridad') },
    completado: {
      color: 'text-[var(--color-success)]',
      label: t('completado'),
    },
  };

  return (
    <AppCard className='flex flex-col'>
      <h3 className='font-heading text-base font-bold text-[var(--color-text)]'>
        {t('actionPlanTitle')}
      </h3>

      {isLoading ? (
        <div className='mt-4 flex flex-col gap-4'>
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className='flex items-center justify-between gap-4 border-b border-[var(--color-border)] pb-4 last:border-b-0'
            >
              <div className='flex flex-1 flex-col gap-2'>
                <div className='h-4 w-32 animate-pulse rounded bg-[var(--color-border)]' />
                <div className='h-3 w-20 animate-pulse rounded bg-[var(--color-border)]' />
              </div>

              <div className='h-8 w-28 animate-pulse rounded-[var(--radius-md)] bg-[var(--color-border)]' />
            </div>
          ))}
        </div>
      ) : items.length === 0 ? (
        <p className='mt-4 font-body text-sm leading-6 text-[var(--color-text-muted)]'>
          {t('actionPlanEmpty')}
        </p>
      ) : (
        <ul className='mt-4 flex flex-col'>
          {items.map((item, index) => {
            const style = priorityStyles[item.priority];

            return (
              <li
                key={`${item.title}-${index}`}
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
                    className='shrink-0 !inline-flex !min-w-[130px] !items-center !justify-center !gap-1.5 !px-3 !py-1.5 text-xs'
                  >
                    {item.actionIcon === 'play' ? (
                      <PlayIcon className='size-3.5 shrink-0' />
                    ) : (
                      <BookOpenIcon className='size-3.5 shrink-0' />
                    )}

                    {item.actionLabel}
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
