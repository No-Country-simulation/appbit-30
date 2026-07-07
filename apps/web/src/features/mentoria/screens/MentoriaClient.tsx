'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { AppShell } from '@/src/components/layout/AppShell';
import { MentorCard } from '../components/MentorCard';
import { BeMentorCard } from '../components/BeMentorCard';
import { MentorFilters } from '../components/MentorFilters';
import { MentorListItem } from '../components/MentorListItem';
import { SessionHistoryItem } from '../components/SessionHistoryItem';

const mockMentors = [
  {
    id: '1',
    nombre: 'Martín Silva',
    rol: 'Lead Data Analyst',
    empresa: 'PedidosYa',
    skills: ['Data Analysis', 'SQL'],
    esRemoto: true,
    rating: 4.9,
    totalResenas: 15,
    esTopMentor: true,
  },
  {
    id: '2',
    nombre: 'Laura Gómez',
    rol: 'Frontend Developer Sr.',
    empresa: 'Mercado Libre',
    skills: ['React', 'TypeScript', 'UX'],
    esRemoto: true,
    rating: 4.8,
    totalResenas: 23,
    esTopMentor: false,
  },
  {
    id: '3',
    nombre: 'Carlos Ruiz',
    rol: 'UX Designer Lead',
    empresa: 'Globant',
    skills: ['UX Research', 'Figma'],
    esRemoto: false,
    rating: 4.7,
    totalResenas: 10,
    esTopMentor: false,
  },
];

const mockSessions = [
  {
    id: '1',
    nombre: 'Carlos Ruiz',
    tipoSesion: 'revisionCV',
    fecha: '12 Octubre',
  },
  {
    id: '2',
    nombre: 'Laura Gómez',
    tipoSesion: 'orientacionCarrera',
    fecha: '5 Octubre',
  },
  {
    id: '3',
    nombre: 'Martín Silva',
    tipoSesion: 'preparacionEntrevistas',
    fecha: '28 Septiembre',
  },
];

type Tab = 'explorar' | 'historial';

export default function MentoriaClient() {
  const t = useTranslations('Mentoria');
  const [tab, setTab] = useState<Tab>('explorar');

  return (
    <AppShell>
      <div className='space-y-6'>
        <h1 className='text-2xl font-bold text-[var(--color-text)]'>{t('title')}</h1>

        <div className='flex gap-6 border-b border-[var(--color-border)]'>
          <button
            onClick={() => setTab('explorar')}
            className={`pb-3 text-sm font-medium transition-colors ${
              tab === 'explorar'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
            }`}
          >
            {t('explorarMentores')}
          </button>
          <button
            onClick={() => setTab('historial')}
            className={`pb-3 text-sm font-medium transition-colors ${
              tab === 'historial'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
            }`}
          >
            {t('historialSesiones')}
          </button>
        </div>

        {tab === 'explorar' && (
          <div className='space-y-6'>
            <section>
              <h2 className='mb-4 text-lg font-bold text-[var(--color-text)]'>{t('title')}</h2>
              <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
                {mockMentors.map((mentor) => (
                  <MentorCard key={mentor.id} {...mentor} onAgendar={() => {}} />
                ))}
                <BeMentorCard />
              </div>
            </section>

            <section>
              <h2 className='mb-4 text-lg font-bold text-[var(--color-text)]'>{t('encontraTuMentor')}</h2>
              <MentorFilters />

              <div className='mt-4 space-y-3'>
                {mockMentors.map((mentor) => (
                  <MentorListItem
                    key={mentor.id}
                    nombre={mentor.nombre}
                    rol={`${mentor.rol} en ${mentor.empresa}`}
                    rating={mentor.rating}
                    totalSesiones={mentor.totalResenas}
                    onAgendar={() => {}}
                  />
                ))}
              </div>
            </section>
          </div>
        )}

        {tab === 'historial' && (
          <section>
            {mockSessions.map((session) => (
              <SessionHistoryItem
                key={session.id}
                nombre={session.nombre}
                tipoSesion={session.tipoSesion}
                fecha={session.fecha}
                onVerNotas={() => {}}
              />
            ))}
          </section>
        )}
      </div>
    </AppShell>
  );
}
