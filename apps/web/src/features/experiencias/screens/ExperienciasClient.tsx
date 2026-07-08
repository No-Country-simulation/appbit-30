'use client';

import { useState } from 'react';
import { AppShell } from '@/src/components/layout/AppShell';
import { CommunityAlertBanner } from '../components/CommunityAlertBanner';
import { LiveEventHero } from '../components/LiveEventHero';
import { EventCategoryTabs } from '../components/EventCategoryTabs';
import { VideoCard } from '../components/VideoCard';
import { UpcomingEventsList } from '../components/UpcomingEventsList';
import { CATEGORIES, mockVideos, mockEvents } from '../data/mock-events';

export function ExperienciasClient() {
  const [activeCategory, setActiveCategory] = useState('todas');

  const filteredVideos =
    activeCategory === 'todas'
      ? mockVideos
      : mockVideos.filter((v) => v.category === activeCategory);

  return (
    <AppShell>
      <div className='space-y-6'>
        <CommunityAlertBanner />
        <LiveEventHero />
        <EventCategoryTabs
          categories={CATEGORIES}
          active={activeCategory}
          onChange={setActiveCategory}
        />
        <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3'>
          {filteredVideos.map((video) => (
            <VideoCard key={video.id} {...video} />
          ))}
        </div>
        <UpcomingEventsList events={mockEvents} />
      </div>
    </AppShell>
  );
}
