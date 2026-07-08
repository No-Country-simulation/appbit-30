'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { RefreshCw } from 'lucide-react';
import { AppShell } from '@/src/components/layout/AppShell';
import { WellbeingCard } from '@/src/features/dashboard/components/WellbeingCard';
import CheckinModal from '@/src/features/dashboard/components/CheckinModal';
import { TrafficAlert } from '../components/TrafficAlert';
import { SuggestionCards } from '../components/SuggestionCards';
import { PromedioSemanal } from '../components/PromedioSemanal';
import { DesgloseMes } from '../components/DesgloseMes';
import { UrgentHelpCard } from '../components/UrgentHelpCard';
import { MoodCalendar } from '../components/MoodCalendar';

export default function BienestarClient() {
  const t = useTranslations('Bienestar');
  const dT = useTranslations('Dashboard');
  const [checkinModalOpen, setCheckinModalOpen] = useState(false);
  const [checkinMood, setCheckinMood] = useState('');
  const [checkinStartStep, setCheckinStartStep] = useState<1 | 2 | 3>(1);
  const [checkinModalKey, setCheckinModalKey] = useState(0);

  return (
    <AppShell>
      <div className='space-y-6'>
        <div className='flex items-center justify-between'>
          <h1 className='text-2xl font-bold text-[var(--color-text)]'>{t('title')}</h1>
          <button
            onClick={() => {
              setCheckinMood('');
              setCheckinStartStep(1);
              setCheckinModalKey((k) => k + 1);
              setCheckinModalOpen(true);
            }}
            className='inline-flex items-center gap-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] px-4 py-2 text-sm font-medium text-[var(--color-text)] transition-colors hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]'
          >
            <RefreshCw className='size-4' />
            {dT('checkinButton')}
          </button>
        </div>

        <div className='grid grid-cols-1 gap-6 lg:grid-cols-3'>
          <div className='space-y-6 lg:col-span-2'>
            <TrafficAlert />

            <div className='rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] p-5'>
              <p className='text-sm leading-relaxed text-[var(--color-text)]'>
                🤖 {t('robotMensaje')}
              </p>
            </div>

            <WellbeingCard
              onEmojiClick={(moodId) => {
                setCheckinMood(moodId);
                setCheckinStartStep(2);
                setCheckinModalKey((k) => k + 1);
                setCheckinModalOpen(true);
              }}
            />

            <SuggestionCards />

            <MoodCalendar />
          </div>

          <div className='space-y-5 lg:col-span-1'>
            <PromedioSemanal />
            <DesgloseMes />
            <UrgentHelpCard />
          </div>
        </div>
      </div>

      <CheckinModal
        key={checkinModalKey}
        open={checkinModalOpen}
        onOpenChange={setCheckinModalOpen}
        initialMood={checkinMood}
        startAtStep={checkinStartStep}
        onSaved={() => {
          setCheckinModalOpen(false);
          window.location.reload();
        }}
      />
    </AppShell>
  );
}
