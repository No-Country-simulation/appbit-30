'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { AppShell } from '@/src/components/layout/AppShell';
import { TabBar } from '@/src/components/app/TabBar';
import { JobCard } from '../components/JobCard';
import { ApplicationCard } from '../components/ApplicationCard';
import { JobDetailModal } from '../components/JobDetailModal';

const MOCK_VACANTES = [
  {
    id: '1',
    titulo: 'Desarrollador Frontend React',
    empresa: 'TechCorp',
    logoUrl: '',
    area: 'Desarrollo Web',
    nivel: 'Semisenior',
    modalidad: 'Remoto',
    ubicacion: 'Argentina',
    matchPorcentaje: 85,
    descripcion: 'Buscamos un desarrollador frontend con experiencia en React para unirse a nuestro equipo de producto.',
    educacionRequerida: 'Universitario (completo)',
    experienciaSolicitada: '3+ años',
    idioma: 'Inglés B1',
    jornada: 'Full time',
    skills: [
      { nombre: 'React', laTienes: true },
      { nombre: 'TypeScript', laTienes: true },
      { nombre: 'Next.js', laTienes: false },
      { nombre: 'Tailwind CSS', laTienes: true },
    ],
  },
  {
    id: '2',
    titulo: 'Data Analyst Jr',
    empresa: 'DataMetrics',
    logoUrl: '',
    area: 'Data & Analytics',
    nivel: 'Junior',
    modalidad: 'Híbrido',
    ubicacion: 'CABA, Argentina',
    matchPorcentaje: 72,
    descripcion: 'Buscamos un Data Analyst para sumarse al equipo de analítica de negocio.',
    educacionRequerida: 'Universitario (incompleto)',
    experienciaSolicitada: 'Sin experiencia',
    idioma: 'Español nativo',
    jornada: 'Full time',
    skills: [
      { nombre: 'SQL', laTienes: true },
      { nombre: 'Python', laTienes: false },
      { nombre: 'Power BI', laTienes: true },
    ],
  },
  {
    id: '3',
    titulo: 'UX/UI Designer',
    empresa: 'DesignLab',
    logoUrl: '',
    area: 'UX/UI Design',
    nivel: 'Semisenior',
    modalidad: 'Remoto',
    ubicacion: 'Latam',
    matchPorcentaje: 91,
    descripcion: 'Buscamos un diseñador UX/UI para crear experiencias digitales excepcionales.',
    educacionRequerida: 'Universitario (completo)',
    experienciaSolicitada: '2+ años',
    idioma: 'Inglés B2',
    jornada: 'Full time',
    skills: [
      { nombre: 'Figma', laTienes: true },
      { nombre: 'Design System', laTienes: true },
      { nombre: 'User Research', laTienes: false },
    ],
  },
];

const MOCK_POSTULACIONES = [
  {
    id: 'p1',
    titulo: 'Desarrollador Frontend React',
    empresa: 'TechCorp',
    estado: 'En_proceso',
    matchPorcentaje: 85,
  },
  {
    id: 'p2',
    titulo: 'Data Analyst Jr',
    empresa: 'DataMetrics',
    estado: 'Vista',
    matchPorcentaje: 72,
  },
  {
    id: 'p3',
    titulo: 'Marketing Specialist',
    empresa: 'GrowthFactory',
    estado: 'Rechazada',
    matchPorcentaje: 45,
    feedback: 'No cumples con el nivel de experiencia requerido.',
    skillRechazada: 'Marketing Digital',
  },
];

export default function EmployabilityClient() {
  const t = useTranslations('Empleabilidad');
  const [activeTab, setActiveTab] = useState('recomendados');
  const [selectedVacante, setSelectedVacante] = useState<typeof MOCK_VACANTES[0] | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  function handleAplicar(vacante: typeof MOCK_VACANTES[0]) {
    setSelectedVacante(vacante);
    setModalOpen(true);
  }

  function handlePostular(data: { mensaje: string; usarCvGuardado: boolean }) {
    setModalOpen(false);
    setSuccessMessage(t('postulacionExitosa'));
    setTimeout(() => setSuccessMessage(null), 3000);
  }

  return (
    <AppShell>
      <div className='space-y-6'>
        <h1 className='text-2xl font-bold text-[var(--color-text)]'>
          {t('title')}
        </h1>

        {successMessage && (
          <div className='rounded-lg bg-[var(--color-success-bg)] px-4 py-3 text-sm text-[var(--color-success-text)]'>
            {successMessage}
          </div>
        )}

        <TabBar
          tabs={[
            { id: 'recomendados', label: t('recomendados'), count: MOCK_VACANTES.length },
            { id: 'aplicaciones', label: t('misAplicaciones'), count: MOCK_POSTULACIONES.length },
          ]}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />

        {activeTab === 'recomendados' && (
          <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
            {MOCK_VACANTES.map((v) => (
              <JobCard
                key={v.id}
                titulo={v.titulo}
                empresa={v.empresa}
                logoUrl={v.logoUrl}
                modalidad={v.modalidad}
                ubicacion={v.ubicacion}
                matchPorcentaje={v.matchPorcentaje}
                skills={v.skills.map((s) => s.nombre)}
                onClick={() => handleAplicar(v)}
                onAplicar={() => handleAplicar(v)}
              />
            ))}
          </div>
        )}

        {activeTab === 'aplicaciones' && (
          <div className='space-y-4'>
            {MOCK_POSTULACIONES.map((p) => (
              <ApplicationCard
                key={p.id}
                titulo={p.titulo}
                empresa={p.empresa}
                estado={p.estado}
                matchPorcentaje={p.matchPorcentaje}
                feedback={(p as any).feedback}
                skillRechazada={(p as any).skillRechazada}
              />
            ))}
          </div>
        )}
      </div>

      {selectedVacante && (
        <JobDetailModal
          open={modalOpen}
          onOpenChange={setModalOpen}
          vacante={selectedVacante}
          onPostular={handlePostular}
        />
      )}
    </AppShell>
  );
}
