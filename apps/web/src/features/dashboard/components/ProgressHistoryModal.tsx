'use client';

import { useFormatter, useTranslations } from 'next-intl';
import { BookCheck, CheckCircle2, GraduationCap, Sparkles } from 'lucide-react';
import type { ProgressHistoryResponse } from '@appbit/shared-schemas';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/src/components/ui/dialog';
import { MatchEvolutionChart } from './MatchEvolutionChart';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: ProgressHistoryResponse | null;
  isLoading: boolean;
  hasError: boolean;
}

const EVENT_ICON = {
  Onboarding: Sparkles,
  Leccion: CheckCircle2,
  Modulo: BookCheck,
  Curso: GraduationCap,
} as const;

export function ProgressHistoryModal({
  open,
  onOpenChange,
  data,
  isLoading,
  hasError,
}: Props) {
  const t = useTranslations('Dashboard');
  const format = useFormatter();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='safe-modal-content w-[min(calc(100vw-1rem),48rem)] p-0'>
        <div className='border-b border-[var(--color-border)] px-4 py-4 pr-11 sm:px-6'>
          <DialogHeader>
            <DialogTitle>{t('historyTitle')}</DialogTitle>
            <DialogDescription>{t('historyDescription')}</DialogDescription>
          </DialogHeader>
        </div>

        <div className='min-w-0 flex-1 overflow-y-auto px-4 py-5 sm:px-6'>
          {isLoading ? (
            <div className='space-y-4' aria-label={t('historyLoading')}>
              <div className='h-28 animate-pulse rounded-xl bg-[var(--color-border)]' />
              <div className='h-20 animate-pulse rounded-xl bg-[var(--color-border)]' />
              <div className='h-20 animate-pulse rounded-xl bg-[var(--color-border)]' />
            </div>
          ) : hasError ? (
            <p role='alert' className='py-8 text-center text-sm text-[var(--color-danger-text)]'>
              {t('historyError')}
            </p>
          ) : data ? (
            <div className='space-y-6'>
              <div className='rounded-2xl border border-violet-100 bg-violet-50/60 p-4 sm:p-5'>
                <div className='mb-4 grid grid-cols-3 gap-2 text-center'>
                  <div>
                    <p className='text-xs text-[var(--color-text-muted)]'>{t('historyInitial')}</p>
                    <p className='text-xl font-black text-[var(--color-text)]'>{data.initialMatch}%</p>
                  </div>
                  <div>
                    <p className='text-xs text-[var(--color-text-muted)]'>{t('historyCurrent')}</p>
                    <p className='text-xl font-black text-[var(--color-primary)]'>{data.currentMatch}%</p>
                  </div>
                  <div>
                    <p className='text-xs text-[var(--color-text-muted)]'>{t('historyVariation')}</p>
                    <p className='text-xl font-black text-[var(--color-success)]'>
                      {data.variation > 0 ? '+' : ''}{data.variation}%
                    </p>
                  </div>
                </div>

                <MatchEvolutionChart series={data.series} />
              </div>

              <section aria-labelledby='progress-events-title'>
                <h3 id='progress-events-title' className='mb-4 font-heading text-base font-bold text-[var(--color-text)]'>
                  {t('historyTimelineTitle')}
                </h3>

                {data.events.length === 0 ? (
                  <p className='rounded-xl border border-dashed border-[var(--color-border)] px-4 py-8 text-center text-sm text-[var(--color-text-muted)]'>
                    {t('historyEmpty')}
                  </p>
                ) : (
                  <ol className='relative ml-3 border-l-2 border-violet-200 pl-7'>
                    {data.events.map((event) => {
                      const Icon = EVENT_ICON[event.type];

                      return (
                        <li key={event.id} className='relative pb-6 last:pb-0'>
                          <span className='absolute -left-[2.45rem] top-0 inline-flex size-8 items-center justify-center rounded-full border-2 border-violet-200 bg-[var(--color-card)] text-[var(--color-primary)]'>
                            <Icon className='size-4' />
                          </span>
                          <p className='font-semibold text-[var(--color-text)]'>{event.title}</p>
                          <p className='mt-1 text-xs text-[var(--color-text-muted)]'>
                            {t(`historyEvent${event.type}` as never)} ·{' '}
                            {format.dateTime(new Date(event.occurredAt), {
                              dateStyle: 'medium',
                              timeStyle: 'short',
                            })}
                          </p>
                          {event.matchAfter !== event.matchBefore && (
                            <p className='mt-2 text-xs font-semibold text-[var(--color-success)]'>
                              {event.matchBefore}% → {event.matchAfter}%
                            </p>
                          )}
                        </li>
                      );
                    })}
                  </ol>
                )}
              </section>
            </div>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}
