'use client';

import { useTranslations } from 'next-intl';
import { Headphones, Footprints, BookOpen } from 'lucide-react';

const suggestions = [
  {
    icon: Headphones,
    titleKey: 'sugerenciaPodcast',
    descKey: 'sugerenciaPodcastDesc',
  },
  {
    icon: Footprints,
    titleKey: 'sugerenciaContacto',
    descKey: 'sugerenciaContactoDesc',
  },
  {
    icon: BookOpen,
    titleKey: 'sugerenciaLectura',
    descKey: 'sugerenciaLecturaDesc',
  },
];

export function SuggestionCards() {
  const t = useTranslations('Bienestar');

  return (
    <section>
      <div className='grid gap-3 sm:grid-cols-3'>
        {suggestions.map(({ icon: Icon, titleKey, descKey }) => (
          <div
            key={titleKey}
            className='flex cursor-pointer flex-col items-center gap-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] p-4 text-center transition-colors hover:border-violet-300 hover:bg-violet-50'
          >
            <Icon className='size-6 text-gray-800' />
            <div>
              <span className='text-sm font-semibold text-gray-900'>{t(titleKey)}</span>
              <p className='mt-0.5 text-xs text-gray-600'>{t(descKey)}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
