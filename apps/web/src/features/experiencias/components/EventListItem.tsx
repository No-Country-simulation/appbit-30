'use client';

import { useTranslations } from 'next-intl';
import { Video, Calendar } from 'lucide-react';
import { AppButton } from '@/src/components/app/AppButton';
import { AppBadge } from '@/src/components/app/AppBadge';
import type { EventItem } from '@/src/features/experiencias/data/mock-events';

interface Props {
  event: EventItem;
}

export function EventListItem({ event }: Props) {
  const t = useTranslations('Experiencias');

  return (
    <div className='flex items-start gap-4 rounded-[var(--radius-md)] bg-[var(--color-card)] p-4 shadow-[var(--shadow-md)]'>
      <div className='flex size-10 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary-pale)]'>
        {event.icon === 'video' ? (
          <Video className='size-5 text-[var(--color-primary)]' />
        ) : (
          <Calendar className='size-5 text-[var(--color-success-text)]' />
        )}
      </div>

      <div className='min-w-0 flex-1'>
        <div className='flex flex-wrap items-center gap-2'>
          {event.type === 'live' && (
            <AppBadge variant='danger' className='text-xs'>
              ● {t('liveSoon')} • {event.date} • {event.time}
            </AppBadge>
          )}
          {event.type === 'upcoming' && (
            <span className='text-xs font-semibold text-[var(--color-text-muted)]'>
              {event.date} • {event.time}
            </span>
          )}
          {event.isHotspot && (
            <AppBadge variant='warning' className='text-xs'>
              📍 {t('hotspotLabel')}: {t(event.location ?? '')}
            </AppBadge>
          )}
        </div>

        <h4 className='mt-2 text-sm font-bold text-[var(--color-text)]'>{t(event.title)}</h4>

        <p className='mt-1 text-xs text-[var(--color-text-muted)]'>
          {t(event.speaker)}
          {event.company && <> • {t(event.company)}</>}
        </p>

        {event.type === 'live' ? (
          <AppButton variant='outline' className='mt-3'>
            {t(event.actionLabel)}
          </AppButton>
        ) : (
          <button className='mt-3 text-sm font-semibold text-[var(--color-primary)] hover:underline'>
            {t(event.actionLabel)}
          </button>
        )}
      </div>
    </div>
  );
}
