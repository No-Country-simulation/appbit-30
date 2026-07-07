'use client';

import { useState } from 'react';
import { useRouter } from '@/src/i18n/navigation';
import { useTranslations } from 'next-intl';
import { AppShell } from '@/src/components/layout/AppShell';
import { InclusionDigitalBanner } from '../components/InclusionDigitalBanner';
import { CurrentModuleCard } from '../components/CurrentModuleCard';
import { ModulesGrid } from '../components/ModulesGrid';
import { ModuleCardItem } from '../components/ModuleCardItem';
import { PaidCoursesSection } from '../components/PaidCoursesSection';
import { PaidCourseCard } from '../components/PaidCourseCard';
import { ExternalCourseValidation } from '../components/ExternalCourseValidation';
import { CertificadoExternoModal } from '../components/CertificadoExternoModal';
import { OfflineDownloadModal } from '../components/OfflineDownloadModal';

export default function FormacionClient() {
  const t = useTranslations('Formacion');
  const router = useRouter();
  const [certModalOpen, setCertModalOpen] = useState(false);
  const [offlineModalOpen, setOfflineModalOpen] = useState(false);

  return (
    <AppShell>
      <div className='space-y-6'>
        <h1 className='text-2xl font-bold text-[var(--color-text)]'>
          {t('title')}
        </h1>

        <InclusionDigitalBanner />

        <CurrentModuleCard
          titulo='SQL para Análisis de Datos'
          progreso={25}
          racha={7}
          onContinuar={() => router.push('/formacion/modulo-1')}
          onGuardarOffline={() => setOfflineModalOpen(true)}
        />

        <ModulesGrid ruta='Data Analyst Jr.'>
          <ModuleCardItem
            titulo='Visualización con PowerBI'
            descripcion='Curso desbloqueado intermedio'
            nivel='Intermedio'
            desbloqueado
            onValidarExterno={() => setCertModalOpen(true)}
          />
          <ModuleCardItem
            titulo='Python Fundamentals'
            descripcion='Base de programación'
            nivel='Intermedio'
            desbloqueado={false}
            onValidarExterno={() => {}}
          />
          <ModuleCardItem
            titulo='Estadística Aplicada'
            descripcion='Fundamentos para ciencia de datos'
            nivel='Avanzado'
            desbloqueado={false}
            onValidarExterno={() => {}}
          />
        </ModulesGrid>

        <PaidCoursesSection>
          <PaidCourseCard
            titulo='Bootcamp Data Science'
            plataforma='Coderhouse'
            descripcion='Formación intensiva en ciencia de datos con proyectos reales.'
            onVerDetalles={() => {}}
          />
          <PaidCourseCard
            titulo='Especialización SQL Avanzado'
            plataforma='Coursera'
            descripcion='Optimización de queries y administración de bases de datos.'
            onVerDetalles={() => {}}
          />
        </PaidCoursesSection>

        <ExternalCourseValidation onValidar={(url) => alert(`Validando: ${url}`)} />

        <CertificadoExternoModal
          open={certModalOpen}
          onOpenChange={setCertModalOpen}
          onSubmit={(data) => {
            alert(`Certificado enviado: ${data.enlace}`);
            setCertModalOpen(false);
          }}
        />

        <OfflineDownloadModal
          open={offlineModalOpen}
          onOpenChange={setOfflineModalOpen}
          items={[
            { titulo: 'Módulo 2: Selects Básicos', tamanioMb: 45, tipo: 'video' },
            { titulo: 'Videos (Calidad Data-Saver)', tamanioMb: 120, tipo: 'video' },
          ]}
          onDownload={() => {
            alert('Descargando módulo...');
            setOfflineModalOpen(false);
          }}
        />
      </div>
    </AppShell>
  );
}
