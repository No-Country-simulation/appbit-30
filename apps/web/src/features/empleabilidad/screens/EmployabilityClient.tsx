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
    empresa: 'TechCorp Latam',
    empresaDescripcion: 'Fintech líder en LATAM · 500-1000 empleados · Buenos Aires',
    logoUrl: '',
    area: 'Desarrollo Web',
    nivel: 'Semisenior',
    modalidad: 'Remoto',
    ubicacion: 'Argentina',
    matchPorcentaje: 85,
    distancia: undefined,
    fechaPublicacion: '1 de julio de 2026',
    descripcion: 'Buscamos un desarrollador frontend con experiencia en React para unirse a nuestro equipo de producto. Trabajarás construyendo interfaces modernas con las últimas tecnologías del ecosistema JavaScript.',
    educacionRequerida: ['Secundario completo', 'Universitario en curso OK'],
    experienciaSolicitada: ['3+ años de experiencia', 'Proyectos personales valorados'],
    idioma: ['Inglés B1', 'Español nativo'],
    jornada: ['Full time', 'Relación de dependencia'],
    skills: [
      { nombre: 'React', laTienes: true },
      { nombre: 'TypeScript', laTienes: true },
      { nombre: 'Next.js', laTienes: false },
      { nombre: 'Tailwind CSS', laTienes: true },
    ],
  },
  {
    id: '2',
    titulo: 'Data Analyst Jr.',
    empresa: 'TechCorp Latam',
    empresaDescripcion: 'Fintech líder en LATAM · 500-1000 empleados · Buenos Aires',
    logoUrl: '',
    area: 'Data Analytics',
    nivel: 'Jr. / Entry Level',
    modalidad: 'Híbrido',
    ubicacion: 'Buenos Aires, CABA',
    matchPorcentaje: 75,
    distancia: '~25 min de tu zona',
    fechaPublicacion: '1 de julio de 2026',
    descripcion: 'Buscamos una persona proactiva para unirse al equipo de datos. Trabajarás limpiando datasets, armando queries en SQL y diseñando tableros de control para la gerencia. Valoramos personas con ganas de aprender y crecer en un entorno ágil.',
    educacionRequerida: ['Secundario completo', 'Universitario en curso OK'],
    experienciaSolicitada: ['Sin experiencia previa', 'Proyectos personales valorados'],
    idioma: ['Español – Nativo', 'Inglés A2 / B1'],
    jornada: ['Jornada completa', 'Relación de dependencia'],
    modalidadDetallada: 'Híbrido – 2 días en oficina',
    skills: [
      { nombre: 'SQL', laTienes: true },
      { nombre: 'Excel Avanzado', laTienes: true },
      { nombre: 'Tableau', laTienes: false },
    ],
  },
  {
    id: '3',
    titulo: 'UX/UI Designer',
    empresa: 'DesignLab',
    empresaDescripcion: 'Estudio de diseño digital · 50-100 empleados · Remoto',
    logoUrl: '',
    area: 'UX/UI Design',
    nivel: 'Semisenior',
    modalidad: 'Remoto',
    ubicacion: 'Latam',
    matchPorcentaje: 91,
    distancia: undefined,
    fechaPublicacion: '28 de junio de 2026',
    descripcion: 'Buscamos un diseñador UX/UI para crear experiencias digitales excepcionales. Trabajarás de la mano con producto y desarrollo para diseñar interfaces intuitivas y atractivas.',
    educacionRequerida: ['Universitario completo'],
    experienciaSolicitada: ['2+ años de experiencia'],
    idioma: ['Inglés B2', 'Español nativo'],
    jornada: ['Full time', 'Contractor'],
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
    titulo: 'Analista de Datos Jr.',
    empresa: 'Nubank',
    estado: 'En_revision',
    mensajesNuevos: 1,
  },
  {
    id: 'p2',
    titulo: 'Data Analyst Trainee',
    empresa: 'Globant',
    estado: 'Rechazada',
    feedback: 'Hola Maria. Nos encantó tu perfil y tu motivación. En esta ocasión avanzamos con candidatos con mayor dominio de PowerBI. Te animamos a fortalecer esa skill y volver a intentarlo en el futuro. ¡Mucho éxito!',
    skillRechazada: 'PowerBI',
  },
  {
    id: 'p3',
    titulo: 'SQL Developer',
    empresa: 'Tech Solutions',
    estado: 'Cerrado',
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
          <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3'>
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
                distancia={v.distancia}
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
                matchPorcentaje={(p as any).matchPorcentaje}
                feedback={(p as any).feedback}
                skillRechazada={(p as any).skillRechazada}
                mensajesNuevos={(p as any).mensajesNuevos}
                onVerMensajes={(p as any).mensajesNuevos ? () => {} : undefined}
                onFortalecer={(p as any).skillRechazada ? () => {} : undefined}
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
