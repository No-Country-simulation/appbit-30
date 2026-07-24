'use client';

import { BookOpen, CheckCircle2, ExternalLink } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { AppBadge } from '@/src/components/app/AppBadge';
import { AppButton } from '@/src/components/app/AppButton';
import type { FormacionActionPlanItem } from '../types';

interface Props {
  items: FormacionActionPlanItem[];
  onOpenCourse: (courseId: string) => void;
}

export function LearningActionPlan({ items, onOpenCourse }: Props) {
  const t = useTranslations('Formacion');

  function getPriority(item: FormacionActionPlanItem) {
    if (item.completed) {
      return { label: t('planCompletado'), variant: 'success' as const };
    }

    if (item.priority === 'Alta_prioridad') {
      return { label: t('prioridadAlta'), variant: 'danger' as const };
    }

    if (item.priority === 'Media_prioridad') {
      return { label: t('prioridadMedia'), variant: 'warning' as const };
    }

    return { label: t('prioridadBaja'), variant: 'primary' as const };
  }

  if (items.length === 0) return null;

  return (
    <section className='min-w-0 space-y-4'>
      <div className='min-w-0'>
        <h3 className='break-words text-base font-bold text-[var(--color-text)]'>
          {t('planAccionTitulo')}
        </h3>
        <p className='mt-1 break-words text-sm leading-relaxed text-[var(--color-text-muted)]'>
          {t('planAccionDescripcion')}
        </p>
      </div>

      <ol className='min-w-0 overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-card)]'>
        {items.map((item, index) => {
          const priority = getPriority(item);

          return (
            <li
              key={item.id}
              className='grid min-w-0 gap-4 border-b border-[var(--color-border)] p-4 last:border-b-0 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center sm:px-5'
            >
              <div className='flex min-w-0 items-start gap-3'>
                <span className='flex size-8 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary-pale)] text-sm font-bold text-[var(--color-primary)]'>
                  {item.completed ? (
                    <CheckCircle2 className='size-4' />
                  ) : (
                    index + 1
                  )}
                </span>

                <div className='min-w-0 flex-1'>
                  <p className='break-words text-sm font-bold leading-snug text-[var(--color-text)] sm:text-base'>
                    {item.title}
                  </p>

                  {item.description && item.description !== item.title && (
                    <p className='mt-1 break-words text-sm leading-relaxed text-[var(--color-text-muted)]'>
                      {item.description}
                    </p>
                  )}

                  <AppBadge variant={priority.variant} className='mt-2'>
                    {priority.label}
                  </AppBadge>
                </div>
              </div>

              {item.completed ? null : item.courseId ? (
                <AppButton
                  variant='outline'
                  className='w-full sm:w-auto'
                  onClick={() => onOpenCourse(item.courseId!)}
                >
                  <ExternalLink className='size-4 shrink-0' />
                  <span>{item.actionLabel ?? t('abrirCurso')}</span>
                </AppButton>
              ) : (
                <div className='inline-flex min-w-0 items-center gap-2 rounded-lg bg-[var(--color-primary-pale)] px-3 py-2 text-sm font-medium text-[var(--color-primary)] sm:max-w-60'>
                  <BookOpen className='size-4 shrink-0' />
                  <span className='min-w-0 break-words'>
                    {item.actionLabel ?? t('accionSugerida')}
                  </span>
                </div>
              )}
            </li>
          );
        })}
      </ol>
    </section>
  );
}
