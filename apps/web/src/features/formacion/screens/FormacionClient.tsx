'use client';

import { useState } from 'react';
import { useRouter } from '@/src/i18n/navigation';
import { useTranslations } from 'next-intl';
import { RefreshCw } from 'lucide-react';
import { AppShell } from '@/src/components/layout/AppShell';
import { AppButton } from '@/src/components/app/AppButton';
import { InclusionDigitalBanner } from '../components/InclusionDigitalBanner';
import { CurrentModuleCard } from '../components/CurrentModuleCard';
import { LearningActionPlan } from '../components/LearningActionPlan';
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
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [regenerationError, setRegenerationError] = useState(false);
  const [completingCourseId, setCompletingCourseId] = useState<string | null>(
    null,
  );
  const [completionError, setCompletionError] = useState(false);
  const [matchChange, setMatchChange] = useState<{
    before: number;
    after: number;
  } | null>(null);

  async function regeneratePlan() {
    if (isRegenerating) return;

    setIsRegenerating(true);
    setRegenerationError(false);

    try {
      const response = await fetch('/api/formacion/plan/regenerar', {
        method: 'POST',
      });

      if (!response.ok) {
        const errorBody = await response.json().catch(() => null);

        console.error('Learning path regeneration failed:', {
          status: response.status,
          errorBody,
        });

        throw new Error(
          errorBody?.message ??
            errorBody?.code ??
            'Learning path regeneration failed',
        );
      }

      router.refresh();
    } catch (error) {
      console.error('Error regenerating learning path:', error);
      setRegenerationError(true);
    } finally {
      setIsRegenerating(false);
    }
  }

  async function completeCourse(course: FormacionCourseCard) {
    if (completingCourseId || course.isCompleted) return;

    setCompletingCourseId(course.id);
    setCompletionError(false);
    setMatchChange(null);

    try {
      const response = await fetch(
        `/api/formacion/cursos/${encodeURIComponent(course.id)}/completar`,
        { method: 'PATCH' },
      );

      if (!response.ok) {
        throw new Error('Course completion failed');
      }

      const result = (await response.json()) as {
        matchBefore: number;
        matchAfter: number;
      };

      setMatchChange({
        before: result.matchBefore,
        after: result.matchAfter,
      });
      router.refresh();
    } catch (error) {
      console.error('Error completing external course:', error);
      setCompletionError(true);
    } finally {
      setCompletingCourseId(null);
    }
  }

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

  function openActionPlanCourse(courseId: string) {
    const course = [
      data.currentCourse,
      ...data.recommendedCourses,
      ...data.paidCourses,
    ].find((item) => item?.id === courseId);

    if (course) openCourse(course);
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
        <div className='flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
          <h1 className='break-words text-2xl font-bold leading-tight text-[var(--color-text)] sm:text-3xl'>
            {t('title')}
          </h1>

          <AppButton
            variant='outline'
            className='w-full sm:w-auto'
            onClick={() => void regeneratePlan()}
            disabled={isRegenerating}
          >
            <RefreshCw
              className={`size-4 shrink-0 ${isRegenerating ? 'animate-spin' : ''}`}
            />
            {isRegenerating ? t('actualizandoPlan') : t('actualizarPlan')}
          </AppButton>
        </div>

        {regenerationError && (
          <p
            role='alert'
            className='rounded-lg border border-[var(--color-danger)] bg-[var(--color-danger-bg)] px-4 py-3 text-sm text-[var(--color-danger-text)]'
          >
            {t('actualizarPlanError')}
          </p>
        )}

        {completionError && (
          <p
            role='alert'
            className='rounded-lg border border-[var(--color-danger)] bg-[var(--color-danger-bg)] px-4 py-3 text-sm text-[var(--color-danger-text)]'
          >
            {t('progresoError')}
          </p>
        )}

        {matchChange && (
          <p
            role='status'
            className='rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800'
          >
            {t('matchActualizado', {
              anterior: matchChange.before,
              nuevo: matchChange.after,
            })}
          </p>
        )}

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
            onMarcarCompletado={
              data.currentCourse.hasInternalContent
                ? undefined
                : () => void completeCourse(data.currentCourse!)
            }
            isCompleting={completingCourseId === data.currentCourse.id}
            isCompleted={data.currentCourse.isCompleted}
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

        <LearningActionPlan
          items={data.actionPlan}
          onOpenCourse={openActionPlanCourse}
        />

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
                primaryIcon={course.hasInternalContent ? 'play' : 'external'}
                onOpen={() => openCourse(course)}
                onValidarExterno={() => setCertModalOpen(true)}
                onComplete={
                  course.hasInternalContent
                    ? undefined
                    : () => void completeCourse(course)
                }
                isCompleting={completingCourseId === course.id}
                isCompleted={course.isCompleted}
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
