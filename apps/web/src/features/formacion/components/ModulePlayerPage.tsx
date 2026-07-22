'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/src/i18n/navigation';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import { AppShell } from '@/src/components/layout/AppShell';
import { AppButton } from '@/src/components/app/AppButton';
import { VideoPlayer } from './VideoPlayer';
import { LessonList } from './LessonList';
import { ModuleSidebar } from './ModuleSidebar';
import { CompletionReward } from './CompletionReward';
import type { ModulePlayerData } from '../types';

interface Props {
  data: ModulePlayerData;
}

export function ModulePlayerPage({ data }: Props) {
  const t = useTranslations('Formacion');
  const router = useRouter();
  const [completingLessonId, setCompletingLessonId] = useState<string | null>(null);
  const [progressError, setProgressError] = useState<string | null>(null);

  const externalUrl = data.externalUrl ?? undefined;

  async function handleCompleteLesson(lesson: ModulePlayerData['lecciones'][number]) {
    if (!lesson.canComplete || completingLessonId) return;

    setCompletingLessonId(lesson.id);
    setProgressError(null);

    try {
      const response = await fetch(
        `/api/formacion/lecciones/${encodeURIComponent(lesson.id)}/completar`,
        { method: 'PATCH' },
      );

      if (!response.ok) {
        throw new Error('Learning progress request failed');
      }

      router.refresh();
    } catch (error) {
      console.error('Error completing lesson:', error);
      setProgressError(t('progresoError'));
    } finally {
      setCompletingLessonId(null);
    }
  }

  return (
    <AppShell userName={data.user.name} avatarUrl={data.user.avatarUrl}>
      <div className='min-w-0 space-y-6'>
        <div className='flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
          <div className='flex min-w-0 flex-wrap items-center gap-3'>
            <button
              type='button'
              onClick={() => router.push('/formacion')}
              className='inline-flex items-center gap-2 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
            >
              <ArrowLeft className='size-4 shrink-0' />
              {t('title')}
            </button>

            <span className='w-fit rounded-full bg-violet-100 px-3 py-1 text-xs font-medium text-violet-700'>
              {t('moduloEnCurso')}
            </span>
          </div>

          {externalUrl && (
            <AppButton
              variant='outline'
              className='w-full sm:w-auto'
              onClick={() => {
                window.open(externalUrl, '_blank', 'noopener,noreferrer');
              }}
            >
              <ExternalLink className='size-4 shrink-0' />
              {t('abrirCurso')}
            </AppButton>
          )}
        </div>

        <div className='grid min-w-0 grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(280px,360px)]'>
          <div className='min-w-0 space-y-6'>
            <VideoPlayer
              titulo={data.leccionActual}
              leccionNumero={
                data.lecciones.find((lesson) => lesson.estado === 'en_progreso')
                  ?.numero
              }
              totalLecciones={data.lecciones.length}
              duracionActual={data.duracionActual}
              duracionTotal={data.duracionTotal}
              progreso={data.progresoLeccion}
              videoUrl={data.videoUrl ?? undefined}
            />

            {progressError && (
              <p
                role='alert'
                className='rounded-lg border border-[var(--color-danger)] bg-[var(--color-danger-bg)] px-4 py-3 text-sm text-[var(--color-danger-text)]'
              >
                {progressError}
              </p>
            )}

            <LessonList
              lecciones={data.lecciones}
              completingLessonId={completingLessonId}
              onCompleteLeccion={(lesson) => void handleCompleteLesson(lesson)}
            />
          </div>

          <div className='min-w-0 space-y-5'>
            <ModuleSidebar
              cursoTitulo={data.cursoTitulo}
              ruta={data.ruta}
              progreso={data.progreso}
              leccionesCompletadas={
                data.lecciones.filter(
                  (lesson) => lesson.estado === 'completada',
                ).length
              }
              totalLecciones={data.lecciones.length}
              racha={data.racha}
              modulos={data.modulos}
            />

            <CompletionReward
              certificado={data.certificado}
              puntos={data.puntos}
              desbloquea={data.desbloquea}
            />
          </div>
        </div>
      </div>
    </AppShell>
  );
}
