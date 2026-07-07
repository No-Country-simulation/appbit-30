'use client';

import { useTranslations } from 'next-intl';
import { CheckCircle, Lock } from 'lucide-react';
import { AppCard } from '@/src/components/app/AppCard';
import { ProgressBar } from '@/src/components/app/ProgressBar';
import { StreakBadge } from '@/src/components/app/StreakBadge';

interface ModuloInfo {
  titulo: string;
  completado: boolean;
  leccionesCompletadas: number;
  totalLecciones: number;
}

interface Props {
  cursoTitulo: string;
  ruta: string;
  progreso: number;
  leccionesCompletadas: number;
  totalLecciones: number;
  racha: number;
  modulos: ModuloInfo[];
}

export function ModuleSidebar({
  cursoTitulo,
  ruta,
  progreso,
  leccionesCompletadas,
  totalLecciones,
  racha,
  modulos,
}: Props) {
  const t = useTranslations('Formacion');

  return (
    <aside className='space-y-5'>
      <AppCard className='space-y-4'>
        <div>
          <p className='text-xs font-medium uppercase tracking-wider text-[var(--color-text-muted)]'>
            {cursoTitulo}
          </p>
          <p className='mt-1 text-sm text-[var(--color-text)]'>
            {t('ruta')}: {ruta}
          </p>
        </div>

        <div className='space-y-2'>
          <div className='flex items-center justify-between text-sm text-[var(--color-text-muted)]'>
            <span>{progreso}%</span>
            <span>
              {leccionesCompletadas}/{totalLecciones} {t('lecciones')}
            </span>
          </div>
          <ProgressBar value={progreso} />
        </div>

        <StreakBadge count={racha} />
      </AppCard>

      <AppCard className='space-y-3'>
        <h4 className='text-sm font-bold text-[var(--color-text)]'>
          {t('modulosDelCurso')}
        </h4>

        {modulos.map((modulo) => (
          <div key={modulo.titulo} className='flex items-center gap-3'>
            {modulo.completado ? (
              <CheckCircle className='size-4 shrink-0 text-[var(--color-success)]' />
            ) : (
              <Lock className='size-4 shrink-0 text-[var(--color-text-muted)]' />
            )}
            <div className='flex-1 min-w-0'>
              <p className='truncate text-sm text-[var(--color-text)]'>{modulo.titulo}</p>
              <p className='text-xs text-[var(--color-text-muted)]'>
                {modulo.leccionesCompletadas}/{modulo.totalLecciones} {t('lecciones')}
              </p>
            </div>
          </div>
        ))}
      </AppCard>
    </aside>
  );
}
