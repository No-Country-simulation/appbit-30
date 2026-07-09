'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { TabBar } from '@/src/components/app/TabBar';
import { LessonItem } from './LessonItem';
import type { ReactNode } from 'react';

interface Lesson {
  numero: number;
  titulo: string;
  duracion: string;
  estado: 'completada' | 'en_progreso' | 'proxima' | 'bloqueada';
}

interface Props {
  lecciones: Lesson[];
  onSelectLeccion?: (leccion: Lesson) => void;
  recursos?: ReactNode;
  notas?: ReactNode;
}

export function LessonList({ lecciones, onSelectLeccion, recursos, notas }: Props) {
  const t = useTranslations('Formacion');
  const [tab, setTab] = useState('lecciones');

  const tabs = [
    { id: 'lecciones', label: t('lecciones') },
    { id: 'recursos', label: t('recursos') },
    { id: 'notas', label: t('notas') },
  ];

  return (
    <div className='space-y-4'>
      <TabBar tabs={tabs} activeTab={tab} onTabChange={setTab} />

      {tab === 'lecciones' && (
        <div className='space-y-1'>
          {lecciones.map((leccion) => (
            <LessonItem
              key={leccion.numero}
              {...leccion}
              onClick={() => onSelectLeccion?.(leccion)}
            />
          ))}
        </div>
      )}

      {tab === 'recursos' && recursos}
      {tab === 'notas' && notas}
    </div>
  );
}
