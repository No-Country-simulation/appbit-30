'use client';

import { useTranslations } from 'next-intl';
import { ArrowLeft } from 'lucide-react';
import { AppShell } from '@/src/components/layout/AppShell';
import { VideoPlayer } from './VideoPlayer';
import { LessonList } from './LessonList';
import { ModuleSidebar } from './ModuleSidebar';
import { CompletionReward } from './CompletionReward';

interface Lesson {
  numero: number;
  titulo: string;
  duracion: string;
  estado: 'completada' | 'en_progreso' | 'proxima' | 'bloqueada';
}

interface ModuloInfo {
  titulo: string;
  completado: boolean;
  leccionesCompletadas: number;
  totalLecciones: number;
}

interface Props {
  moduleTitulo: string;
  cursoTitulo: string;
  ruta: string;
  progreso: number;
  leccionActual: string;
  duracionActual: string;
  duracionTotal: string;
  progresoLeccion: number;
  lecciones: Lesson[];
  modulos: ModuloInfo[];
  racha: number;
  certificado: string;
  puntos: number;
  desbloquea: string;
  onVolver: () => void;
}

export function ModulePlayerPage({
  moduleTitulo,
  cursoTitulo,
  ruta,
  progreso,
  leccionActual,
  duracionActual,
  duracionTotal,
  progresoLeccion,
  lecciones,
  modulos,
  racha,
  certificado,
  puntos,
  desbloquea,
  onVolver,
}: Props) {
  const t = useTranslations('Formacion');

  return (
    <AppShell>
      <div className='space-y-6'>
        <button
          onClick={onVolver}
          className='inline-flex items-center gap-2 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
        >
          <ArrowLeft className='size-4' />
          {t('title')}
        </button>

        <div className='grid grid-cols-1 gap-6 lg:grid-cols-3'>
          <div className='space-y-6 lg:col-span-2'>
            <VideoPlayer
              titulo={leccionActual}
              duracionActual={duracionActual}
              duracionTotal={duracionTotal}
              progreso={progresoLeccion}
            />

            <LessonList lecciones={lecciones} />

            <CompletionReward
              certificado={certificado}
              puntos={puntos}
              desbloquea={desbloquea}
            />
          </div>

          <div className='lg:col-span-1'>
            <ModuleSidebar
              cursoTitulo={cursoTitulo}
              ruta={ruta}
              progreso={progreso}
              leccionesCompletadas={lecciones.filter((l) => l.estado === 'completada').length}
              totalLecciones={lecciones.length}
              racha={racha}
              modulos={modulos}
            />
          </div>
        </div>
      </div>
    </AppShell>
  );
}

export default function ModulePlayerScreen() {
  return (
    <ModulePlayerPage
      moduleTitulo='SQL para Análisis de Datos'
      cursoTitulo='SQL para Análisis de Datos'
      ruta='Data Analyst Jr.'
      progreso={25}
      leccionActual='JOINs y subconsultas en SQL'
      duracionActual='7:12'
      duracionTotal='20:30'
      progresoLeccion={35}
      lecciones={[
        { numero: 1, titulo: '¿Qué es SQL? Introducción', duracion: '12:00', estado: 'completada' },
        { numero: 2, titulo: 'JOINs y subconsultas en SQL', duracion: '20:30', estado: 'en_progreso' },
        { numero: 3, titulo: 'GROUP BY y funciones de agregación', duracion: '18:45', estado: 'proxima' },
        { numero: 4, titulo: 'Índices y optimización de queries', duracion: '22:10', estado: 'proxima' },
        { numero: 5, titulo: 'Proyecto final: Análisis de ventas', duracion: '35:00', estado: 'bloqueada' },
      ]}
      modulos={[
        { titulo: 'Fundamentos SQL', completado: true, leccionesCompletadas: 2, totalLecciones: 8 },
        { titulo: 'SQL Avanzado', completado: false, leccionesCompletadas: 0, totalLecciones: 6 },
        { titulo: 'Proyecto final', completado: false, leccionesCompletadas: 0, totalLecciones: 4 },
      ]}
      racha={7}
      certificado='SQL Básico'
      puntos={15}
      desbloquea='SQL Avanzado'
      onVolver={() => window.history.back()}
    />
  );
}
