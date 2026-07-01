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
}

export function ActionPlanCard({ items }: Props) {
  const t = useTranslations('Dashboard');

  const defaultItems: ActionItem[] = [
    {
      title: 'SQL Avanzado',
      priority: 'alta',
      actionLabel: t('actionLabelIniciar'),
      actionIcon: 'play',
    },
    {
      title: 'PowerBI / Dashboards',
      priority: 'media',
      actionLabel: t('actionLabelVerTemario'),
      actionIcon: 'book',
    },
    {
      title: 'Python Fundamentals',
      priority: 'completado',
      actionLabel: t('actionLabelIniciar'),
      actionIcon: 'play',
      completed: true,
    },
  ];

  const resolvedItems = items ?? defaultItems;

  const priorityStyles = {
    alta: { color: 'text-[var(--color-danger)]', label: t('altaPrioridad') },
    media: { color: 'text-[var(--color-warning)]', label: t('mediaPrioridad') },
    completado: { color: 'text-[var(--color-success)]', label: t('completado') },
  };

  return (
    <AppCard className='flex flex-col'>
      <h3 className='font-heading text-base font-bold text-[var(--color-text)]'>
        {t('actionPlanTitle')}
      </h3>

      <ul className='mt-4 flex flex-col'>
        {resolvedItems.map((item, index) => {
          const style = priorityStyles[item.priority];
          return (
            <li
              key={item.title}
              className={`flex items-center justify-between gap-4 py-4 ${
                index < resolvedItems.length - 1
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
                  className='shrink-0 !inline-flex !items-center !justify-center !gap-1.5 !min-w-[130px] !px-3 !py-1.5 text-xs'
                >
                  {item.actionIcon === 'play' ? (
                    <PlayIcon className='shrink-0 size-3.5' />
                  ) : (
                    <BookOpenIcon className='shrink-0 size-3.5' />
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
