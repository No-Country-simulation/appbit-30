'use client';

import { useTranslations } from 'next-intl';
import { Bot } from 'lucide-react';
import { AppShell } from '@/src/components/layout/AppShell';
import { TrafficAlert } from '../components/TrafficAlert';
import { SuggestionCards } from '../components/SuggestionCards';
import { PromedioSemanal } from '../components/PromedioSemanal';
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
            <div className='rounded-xl border-2 border-violet-300 bg-gradient-to-br from-violet-100 via-purple-100 to-violet-200 p-5 space-y-5'>
              <div className='rounded-xl bg-white/60 p-5'>
              <div className='flex items-center gap-2'>
                <Bot className='size-5 text-violet-600' />
                <p className='text-base font-bold leading-relaxed text-[var(--color-text)]'>
                  {t('robotMensaje')}
                </p>
              </div>
              </div>

              <TrafficAlert />

              <p className='text-sm leading-relaxed text-[var(--color-text-muted)]'>
                {t('subtituloSugerencias')}
              </p>

              <SuggestionCards />
            </div>

            <MoodCalendar />
          </div>

          <div className='space-y-5 lg:col-span-1'>
            <PromedioSemanal />
            <UrgentHelpCard />
          </div>
        </div>
      </div>
    </AppShell>
  );
}
