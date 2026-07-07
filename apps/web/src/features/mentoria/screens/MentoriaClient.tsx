'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { AppShell } from '@/src/components/layout/AppShell';
import { MentorCard } from '../components/MentorCard';
import { BeMentorCard } from '../components/BeMentorCard';
import { BeMentorModal } from '../components/BeMentorModal';
import { MentorFilters } from '../components/MentorFilters';
import { MentorListItem } from '../components/MentorListItem';
import { SessionHistoryItem } from '../components/SessionHistoryItem';

const mockMentors = [
  {
    id: '1',
    foto: 'https://i.pravatar.cc/400?img=11',
    nombre: 'Martín Silva',
    rol: 'Lead Data Analyst',
    empresa: 'PedidosYa',
    skills: ['Data Analysis', 'SQL'],
    rating: 4.9,
    totalResenas: 15,
    esTopMentor: true,
  },
  {
    id: '2',
    foto: 'https://i.pravatar.cc/400?img=5',
    nombre: 'Laura Gómez',
    rol: 'Frontend Developer Sr.',
    empresa: 'Mercado Libre',
    skills: ['React', 'TypeScript', 'UX'],
    rating: 4.8,
    totalResenas: 23,
    esTopMentor: true,
  },
  {
    id: '3',
    foto: 'https://i.pravatar.cc/400?img=12',
    nombre: 'Carlos Ruiz',
    rol: 'UX Designer Lead',
    empresa: 'Globant',
    skills: ['UX Research', 'Figma'],
    rating: 4.7,
    totalResenas: 10,
    esTopMentor: true,
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
  const [beMentorModalOpen, setBeMentorModalOpen] = useState(false);

  return (
    <AppShell>
      <div className='space-y-6'>
        <h1 className='text-2xl font-bold text-[var(--color-text)]'>{t('title')}</h1>

        <div className='flex gap-6 border-b border-[var(--color-border)]'>
          <button
            onClick={() => setTab('explorar')}
            className={`pb-3 text-sm font-medium transition-colors ${
              tab === 'explorar'
                ? 'border-b-2 border-violet-500 text-violet-600'
                : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
            }`}
          >
            {t('explorarMentores')}
          </button>
          <button
            onClick={() => setTab('historial')}
            className={`pb-3 text-sm font-medium transition-colors ${
              tab === 'historial'
                ? 'border-b-2 border-violet-500 text-violet-600'
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
                  <div key={mentor.id} className='mx-auto w-full max-w-sm'>
                    <MentorCard
                      foto={mentor.foto}
                      nombre={mentor.nombre}
                      rol={mentor.rol}
                      empresa={mentor.empresa}
                      skills={mentor.skills}
                      rating={mentor.rating}
                      totalResenas={mentor.totalResenas}
                      esTopMentor={mentor.esTopMentor}
                      onAgendar={() => {}}
                    />
                  </div>
                ))}
                <div className='mx-auto w-full max-w-sm'>
                  <BeMentorCard onClick={() => setBeMentorModalOpen(true)} />
                </div>
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

      <BeMentorModal
        open={beMentorModalOpen}
        onOpenChange={setBeMentorModalOpen}
        onSubmit={(data) => {
          console.log('Solicitud de mentor:', data);
          setBeMentorModalOpen(false);
        }}
      />
    </AppShell>
  );
}
