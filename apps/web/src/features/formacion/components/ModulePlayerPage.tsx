'use client';

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

  const externalUrl = data.externalUrl ?? undefined;

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

            <LessonList lecciones={data.lecciones} />
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
