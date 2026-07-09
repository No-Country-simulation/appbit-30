'use client';

import { useTranslations } from 'next-intl';
import { Calendar, Video } from 'lucide-react';
import { AppButton } from '@/src/components/app/AppButton';
import { AppBadge } from '@/src/components/app/AppBadge';
import type { EventItem } from '@/src/features/experiencias/data/mock-events';

interface Props {
  event: EventItem;
}

export function EventListItem({ event }: Props) {
  const t = useTranslations('Experiencias');

  return (
    <article className='flex min-w-0 flex-col gap-4 rounded-[var(--radius-md)] bg-[var(--color-card)] p-4 shadow-[var(--shadow-md)] sm:flex-row sm:items-start'>
      <div className='flex size-10 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary-pale)]'>
        {event.icon === 'video' ? (
          <Video className='size-5 text-[var(--color-primary)]' />
        ) : (
          <Calendar className='size-5 text-[var(--color-success-text)]' />
        )}
      </div>

      <div className='min-w-0 flex-1'>
        <div className='flex min-w-0 flex-wrap items-center gap-2'>
          {event.type === 'live' && (
            <AppBadge variant='danger' className='text-xs'>
              ● {t('liveSoon')} • {event.date} • {event.time}
            </AppBadge>
          )}

          {event.type === 'upcoming' && (
            <span className='break-words text-xs font-semibold text-[var(--color-text-muted)]'>
              {event.date} • {event.time}
            </span>
          )}

          {event.isHotspot && (
            <AppBadge variant='warning' className='text-xs'>
              📍 {t('hotspotLabel')}
            </AppBadge>
          )}
        </div>

        <h4 className='mt-2 break-words text-sm font-bold leading-tight text-[var(--color-text)]'>
          {t(event.title)}
        </h4>

        <p className='mt-1 break-words text-xs leading-relaxed text-[var(--color-text-muted)]'>
          {t(event.speaker)}
          {event.company && <> • {t(event.company)}</>}
        </p>

        {event.type === 'live' ? (
          <AppButton variant='outline' className='mt-3 w-full sm:w-auto'>
            {t(event.actionLabel)}
          </AppButton>
        ) : (
          <button
            type='button'
            className='mt-3 text-sm font-semibold text-[var(--color-primary)] hover:underline'
          >
            {t(event.actionLabel)}
          </button>
        )}
      </div>
    </article>
  );
}
