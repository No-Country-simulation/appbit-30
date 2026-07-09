'use client';

import { useTranslations } from 'next-intl';
import { Bot } from 'lucide-react';
import { AppShell } from '@/src/components/layout/AppShell';
import { TrafficAlert } from '../components/TrafficAlert';
import { SuggestionCards } from '../components/SuggestionCards';
import { PromedioSemanal } from '../components/PromedioSemanal';
import { UrgentHelpCard } from '../components/UrgentHelpCard';
import { MoodCalendar } from '../components/MoodCalendar';
import type { BienestarData } from '../types';

interface Props {
  data: BienestarData;
}

export default function BienestarClient({ data }: Props) {
  const t = useTranslations('Bienestar');

  const hasCurrentMonthCheckins = data.calendar.days.some((day) =>
    Boolean(day.emoji),
  );

  const shouldShowLatestResponse =
    hasCurrentMonthCheckins && Boolean(data.latestResponse);

  const robotMessage = shouldShowLatestResponse
    ? data.latestResponse!.mensaje
    : t('robotMensaje');

  const aiAction = shouldShowLatestResponse
    ? data.latestResponse!.accionSugerida
    : null;

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
        </div>

        <div className='grid min-w-0 grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(280px,360px)]'>
          <div className='min-w-0 space-y-6'>
            <section className='min-w-0 space-y-5 rounded-xl border-2 border-violet-300 bg-gradient-to-br from-violet-100 via-purple-100 to-violet-200 p-4 sm:p-5'>
              <div className='min-w-0 rounded-xl bg-white/70 p-4 sm:p-5'>
                <div className='flex min-w-0 items-start gap-3'>
                  <Bot className='mt-0.5 size-5 shrink-0 text-violet-600' />

                  <div className='min-w-0'>
                    <p className='break-words text-base font-bold leading-relaxed text-[var(--color-text)]'>
                      {robotMessage}
                    </p>

                    {!shouldShowLatestResponse && (
                      <p className='mt-2 break-words text-sm leading-relaxed text-[var(--color-text-muted)]'>
                        {t('subtituloSugerencias')}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {data.offlineAlert && (
                <TrafficAlert mensaje={data.offlineAlert.mensaje} />
              )}

              <SuggestionCards accionSugerida={aiAction} />
            </section>

            <MoodCalendar
              calendar={data.calendar}
              hasCheckins={hasCurrentMonthCheckins}
            />
          </div>

          <div className='min-w-0 space-y-5'>
            <PromedioSemanal
              average={data.weeklyAverage}
              breakdown={data.monthlyBreakdown}
            />

            {data.shouldShowUrgentHelp && <UrgentHelpCard />}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
