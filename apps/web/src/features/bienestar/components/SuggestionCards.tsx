'use client';

import { useTranslations } from 'next-intl';
import { Headphones, Users, BookOpen } from 'lucide-react';

const suggestions = [
  { icon: Headphones, key: 'sugerenciaPodcast' },
  { icon: Users, key: 'sugerenciaContacto' },
  { icon: BookOpen, key: 'sugerenciaLectura' },
];

export function SuggestionCards() {
  const t = useTranslations('Bienestar');

  return (
    <section>
      <h3 className='mb-3 text-sm font-bold text-[var(--color-text)]'>{t('sugerencias')}</h3>
      <div className='grid gap-3 sm:grid-cols-3'>
        {suggestions.map(({ icon: Icon, key }) => (
          <div
            key={key}
            className='flex cursor-pointer flex-col items-center gap-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] p-4 text-center transition-colors hover:border-violet-300 hover:bg-violet-50'
          >
            <Icon className='size-6 text-violet-600' />
            <span className='text-sm font-medium text-[var(--color-text)]'>{t(key)}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
