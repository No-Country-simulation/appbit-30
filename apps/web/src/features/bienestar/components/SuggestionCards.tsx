'use client';

import { useTranslations } from 'next-intl';
import { BookOpen, Footprints, Headphones, Sparkles } from 'lucide-react';

interface Props {
  accionSugerida?: string | null;
}

export function SuggestionCards({ accionSugerida }: Props) {
  const t = useTranslations('Bienestar');

  if (accionSugerida) {
    return (
      <section className='min-w-0'>
        <div className='min-w-0 rounded-xl border border-violet-200 bg-white p-4 shadow-sm'>
          <div className='flex min-w-0 items-start gap-3'>
            <div className='flex size-9 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary-pale)] text-[var(--color-primary)]'>
              <Sparkles className='size-5' />
            </div>

            <div className='min-w-0'>
              <p className='break-words text-sm font-bold text-[var(--color-text)]'>
                {t('accionSugeridaTitle')}
              </p>

              <p className='mt-1 break-words text-sm leading-relaxed text-[var(--color-text-muted)]'>
                {accionSugerida}
              </p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  const suggestions = [
    {
      icon: Headphones,
      title: t('sugerenciaPodcast'),
      desc: t('sugerenciaPodcastDesc'),
    },
    {
      icon: Footprints,
      title: t('sugerenciaContacto'),
      desc: t('sugerenciaContactoDesc'),
    },
    {
      icon: BookOpen,
      title: t('sugerenciaLectura'),
      desc: t('sugerenciaLecturaDesc'),
    },
  ];

  return (
    <section className='min-w-0'>
      <h3 className='mb-3 break-words text-sm font-bold text-[var(--color-text)]'>
        {t('sugerencias')}
      </h3>

      <div className='grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3'>
        {suggestions.map(({ icon: Icon, title, desc }) => (
          <div
            key={title}
            className='flex min-w-0 flex-col items-center gap-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] p-4 text-center transition-colors hover:border-violet-300 hover:bg-violet-50'
          >
            <Icon className='size-6 shrink-0 text-gray-800' />

            <div className='min-w-0'>
              <span className='break-words text-sm font-semibold text-gray-900'>
                {title}
              </span>

              <p className='mt-1 break-words text-xs leading-relaxed text-gray-600'>
                {desc}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
