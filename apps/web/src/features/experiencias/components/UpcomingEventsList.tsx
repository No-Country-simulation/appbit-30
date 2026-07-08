'use client';

import { useTranslations } from 'next-intl';
import { EventListItem } from './EventListItem';
import type { EventItem } from '@/src/features/experiencias/data/mock-events';

interface Props {
  events: EventItem[];
}

export function UpcomingEventsList({ events }: Props) {
  const t = useTranslations('Experiencias');

  return (
    <section>
      <h3 className='mb-4 text-lg font-bold text-[var(--color-text)]'>
        {t('upcomingTalks')}
      </h3>
      <div className='space-y-3'>
        {events.map((event) => (
          <EventListItem key={event.id} event={event} />
        ))}
      </div>
    </section>
  );
}
