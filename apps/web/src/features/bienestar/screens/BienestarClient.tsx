'use client';

import { useTranslations } from 'next-intl';
import { AppShell } from '@/src/components/layout/AppShell';
import { TrafficAlert } from '../components/TrafficAlert';
import { SuggestionCards } from '../components/SuggestionCards';
import { PromedioSemanal } from '../components/PromedioSemanal';
import { DesgloseMes } from '../components/DesgloseMes';
import { UrgentHelpCard } from '../components/UrgentHelpCard';
import { MoodCalendar } from '../components/MoodCalendar';

export default function BienestarClient() {
  const t = useTranslations('Bienestar');

  return (
    <AppShell>
      <div className='space-y-6'>
        <h1 className='text-2xl font-bold text-[var(--color-text)]'>{t('title')}</h1>

        <div className='grid grid-cols-1 gap-6 lg:grid-cols-3'>
          <div className='space-y-6 lg:col-span-2'>
            <TrafficAlert />

            <div className='rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] p-5'>
              <p className='text-sm leading-relaxed text-[var(--color-text)]'>
                🤖 {t('robotMensaje')}
              </p>
            </div>

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
    </AppShell>
  );
}
