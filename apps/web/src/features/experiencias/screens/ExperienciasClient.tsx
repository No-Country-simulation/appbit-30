'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { AppShell } from '@/src/components/layout/AppShell';
import { CommunityAlertBanner } from '../components/CommunityAlertBanner';
import { LiveEventHero } from '../components/LiveEventHero';
import { EventCategoryTabs } from '../components/EventCategoryTabs';
import { VideoCard } from '../components/VideoCard';
import { UpcomingEventsList } from '../components/UpcomingEventsList';
import { CATEGORIES, mockVideos, mockEvents } from '../data/mock-events';
import type { ExperienciasData } from '../types';

interface Props {
  data: ExperienciasData;
}

export function ExperienciasClient({ data }: Props) {
  const t = useTranslations('Experiencias');
  const [activeCategory, setActiveCategory] = useState('todas');

  const filteredVideos =
    activeCategory === 'todas'
      ? mockVideos
      : mockVideos.filter((video) => video.category === activeCategory);

  return (
    <AppShell
      userName={data.user.name}
      avatarUrl={data.user.avatarUrl}
      profilePercent={data.user.profilePercent}
      perfilBreakdown={data.user.perfilBreakdown}
    >
      <div className='min-w-0 space-y-6'>
        <div className='min-w-0'>
          <h1 className='break-words text-2xl font-bold leading-tight text-[var(--color-text)] sm:text-3xl'>
            {t('title')}
          </h1>

          <p className='mt-1 max-w-3xl break-words text-sm leading-relaxed text-[var(--color-text-muted)]'>
            {t('subtitle')}
          </p>
        </div>

        <CommunityAlertBanner />

        <LiveEventHero />

        <EventCategoryTabs
          categories={CATEGORIES}
          active={activeCategory}
          onChange={setActiveCategory}
        />

        <section className='min-w-0'>
          <div className='grid min-w-0 grid-cols-1 gap-4 sm:[grid-template-columns:repeat(auto-fit,minmax(min(100%,16rem),1fr))]'>
            {filteredVideos.map((video) => (
              <VideoCard key={video.id} {...video} />
            ))}
          </div>
        </section>

        <UpcomingEventsList events={mockEvents} />
      </div>
    </AppShell>
  );
}
