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
import { CertificadoExternoModal } from '../components/CertificadoExternoModal';
import { OfflineDownloadModal } from '../components/OfflineDownloadModal';
import type { FormacionData, FormacionCourseCard } from '../types';

interface Props {
  data: FormacionData;
}

export default function FormacionClient({ data }: Props) {
  const t = useTranslations('Formacion');
  const router = useRouter();
  const [certModalOpen, setCertModalOpen] = useState(false);
  const [offlineModalOpen, setOfflineModalOpen] = useState(false);

  function openCourse(course: FormacionCourseCard) {
    if (course.hasInternalContent) {
      router.push(`/formacion/${course.id}`);
      return;
    }

    if (course.externalUrl) {
      window.open(course.externalUrl, '_blank', 'noopener,noreferrer');
      return;
    }

    router.push(`/formacion/${course.id}`);
  }

  function getPrimaryActionLabel(course: FormacionCourseCard) {
    if (course.hasInternalContent) {
      return t('continuar');
    }

    if (course.externalUrl) {
      return t('abrirCurso');
    }

    return t('verDetalles');
  }

  function openExternalCourse(course: FormacionCourseCard) {
    if (!course.externalUrl) {
      openCourse(course);
      return;
    }

    window.open(course.externalUrl, '_blank', 'noopener,noreferrer');
  }

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
        </div>

        {data.showInclusionBanner && <InclusionDigitalBanner />}

        {data.currentCourse ? (
          <CurrentModuleCard
            titulo={data.currentCourse.planTitle ?? data.currentCourse.title}
            progreso={data.currentCourse.progress}
            racha={data.streakDays}
            canSaveOffline={data.offlineItems.length > 0}
            onContinuar={() => openCourse(data.currentCourse!)}
            onGuardarOffline={() => setOfflineModalOpen(true)}
            primaryLabel={getPrimaryActionLabel(data.currentCourse)}
            primaryIcon={
              data.currentCourse.hasInternalContent ? 'play' : 'external'
            }
            showProgress={data.currentCourse.hasInternalContent}
          />
        ) : (
          <section className='rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] p-5'>
            <h2 className='text-base font-bold text-[var(--color-text)]'>
              {t('sinCursosTitulo')}
            </h2>
            <p className='mt-1 text-sm text-[var(--color-text-muted)]'>
              {t('sinCursosDesc')}
            </p>
          </section>
        )}

        {data.recommendedCourses.length > 0 && (
          <ModulesGrid ruta={data.rutaLabel}>
            {data.recommendedCourses.map((course) => (
              <ModuleCardItem
                key={course.id}
                titulo={course.planTitle ?? course.title}
                descripcion={
                  course.planTitle
                    ? `${course.title}${course.platform ? ` · ${course.platform}` : ''}`
                    : (course.subtitle ??
                      course.description ??
                      `${course.platform ?? ''} · ${course.areaLabel}`)
                }
                nivel={course.areaLabel}
                plataforma={course.platform}
                duracionDias={course.durationDays}
                desbloqueado
                primaryLabel={getPrimaryActionLabel(course)}
                onOpen={() => openCourse(course)}
                onValidarExterno={() => setCertModalOpen(true)}
              />
            ))}
          </ModulesGrid>
        )}

        {data.paidCourses.length > 0 && (
          <PaidCoursesSection>
            {data.paidCourses.map((course) => (
              <PaidCourseCard
                key={course.id}
                titulo={course.title}
                plataforma={course.platform ?? course.type}
                descripcion={
                  course.description ??
                  course.subtitle ??
                  `${course.areaLabel}${course.durationDays ? ` · ${course.durationDays} días` : ''}`
                }
                onVerDetalles={() => openExternalCourse(course)}
              />
            ))}
          </PaidCoursesSection>
        )}

        <CertificadoExternoModal
          open={certModalOpen}
          onOpenChange={setCertModalOpen}
          onSubmit={() => {
            setCertModalOpen(false);
          }}
        />

        <OfflineDownloadModal
          open={offlineModalOpen}
          onOpenChange={setOfflineModalOpen}
          items={data.offlineItems.map((item) => ({
            titulo: item.titulo,
            tamanioMb: item.tamanioMb,
            tipo: item.tipo === 'PDF' ? 'pdf' : 'video',
          }))}
          onDownload={() => {
            setOfflineModalOpen(false);
          }}
        />
      </div>
    </AppShell>
  );
}
