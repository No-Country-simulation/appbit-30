'use client';

import { useTranslations } from 'next-intl';
import { AppChoiceChips } from '@/src/components/app/AppChoiceChips';

export function MentorFilters() {
  const t = useTranslations('Mentoria');

  const options = [
    { label: t('todos'), value: 'todos' },
    { label: 'Data Analytics', value: 'data' },
    { label: 'Frontend', value: 'frontend' },
    { label: 'UX Design', value: 'ux' },
    { label: t('disponibleEstaSemana'), value: 'disponible' },
  ];

  return <AppChoiceChips options={options} defaultSelected={['todos']} />;
}
