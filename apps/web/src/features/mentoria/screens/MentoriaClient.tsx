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
import type { MentoriaData } from '../types';

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

interface Props {
  data: MentoriaData;
}

export default function MentoriaClient({ data }: Props) {
  const t = useTranslations('Mentoria');
  const [tab, setTab] = useState<Tab>('explorar');
  const [beMentorModalOpen, setBeMentorModalOpen] = useState(false);

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

          <p className='mt-1 max-w-3xl break-words text-sm leading-relaxed text-[var(--color-text-muted)]'>
            {t('subtitle')}
          </p>
        </div>

        <div className='flex min-w-0 gap-6 overflow-x-auto border-b border-[var(--color-border)]'>
          <button
            type='button'
            onClick={() => setTab('explorar')}
            className={`shrink-0 pb-3 text-sm font-medium transition-colors ${
              tab === 'explorar'
                ? 'border-b-2 border-violet-500 text-violet-600'
                : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
            }`}
          >
            {t('explorarMentores')}
          </button>

          <button
            type='button'
            onClick={() => setTab('historial')}
            className={`shrink-0 pb-3 text-sm font-medium transition-colors ${
              tab === 'historial'
                ? 'border-b-2 border-violet-500 text-violet-600'
                : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
            }`}
          >
            {t('historialSesiones')}
          </button>
        </div>

        {tab === 'explorar' && (
          <div className='min-w-0 space-y-6'>
            <section className='min-w-0 space-y-4'>
              <div className='min-w-0'>
                <h2 className='break-words text-lg font-bold text-[var(--color-text)]'>
                  {t('mentoresDestacados')}
                </h2>

                <p className='mt-1 break-words text-sm leading-relaxed text-[var(--color-text-muted)]'>
                  {t('mentoresDestacadosDesc')}
                </p>
              </div>

              <div className='grid min-w-0 grid-cols-1 gap-4 sm:[grid-template-columns:repeat(auto-fit,minmax(min(100%,18rem),1fr))]'>
                {mockMentors.map((mentor) => (
                  <MentorCard
                    key={mentor.id}
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
                ))}

                <BeMentorCard onClick={() => setBeMentorModalOpen(true)} />
              </div>
            </section>

            <section className='min-w-0 space-y-4'>
              <div className='min-w-0'>
                <h2 className='break-words text-lg font-bold text-[var(--color-text)]'>
                  {t('encontraTuMentor')}
                </h2>
              </div>

              <MentorFilters />

              <div className='min-w-0 space-y-3'>
                {mockMentors.map((mentor) => (
                  <MentorListItem
                    key={mentor.id}
                    nombre={mentor.nombre}
                    rol={`${mentor.rol} ${t('en')} ${mentor.empresa}`}
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
          <section className='min-w-0 space-y-3'>
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
        onSubmit={() => {
          setBeMentorModalOpen(false);
        }}
      />
    </AppShell>
  );
}
