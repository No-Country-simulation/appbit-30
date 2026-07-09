'use client';

import { useTranslations } from 'next-intl';
import { ProgressBar } from '@/src/components/app/ProgressBar';

interface ModuloInfo {
  titulo: string;
  completado: boolean;
  enProgreso: boolean;
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
      <div className='rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] p-5 space-y-4'>
        <div>
          <h3 className='text-base font-bold text-[var(--color-text)]'>
            {cursoTitulo}
          </h3>
          <p className='mt-0.5 text-sm text-[var(--color-text-muted)]'>
            {t('ruta')}: {ruta}
          </p>
        </div>

        <div className='space-y-2'>
          <div className='flex items-center justify-between'>
            <span className='text-sm font-medium text-[var(--color-text)]'>
              {t('progresoModulo')}
            </span>
            <span className='text-sm font-bold text-violet-600'>
              {progreso}%
            </span>
          </div>
          <ProgressBar
            value={progreso}
            className='bg-gray-200'
            barClassName='bg-emerald-500'
          />
        </div>

        <div className='flex items-center justify-between text-sm text-[var(--color-text-muted)]'>
          <span>
            {leccionesCompletadas} {t('de')} {totalLecciones} {t('lecciones')}
          </span>
          <span>
            🔥 {racha} {t('diasDeRacha')}
          </span>
        </div>
      </div>

      <div className='rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] p-5 space-y-3'>
        <h4 className='text-sm font-bold text-[var(--color-text)]'>
          {t('modulosDelCurso')}
        </h4>

        {modulos.map((modulo, index) => (
          <div
            key={modulo.titulo}
            className={`rounded-lg border p-3 ${
              modulo.enProgreso
                ? 'border-violet-400 bg-violet-50'
                : modulo.completado
                  ? 'border-[var(--color-border)] bg-[var(--color-card)]'
                  : 'border-[var(--color-border)] bg-gray-50'
            }`}
          >
            <div className='flex items-center justify-between'>
              <span className='text-sm font-bold text-[var(--color-text)]'>
                {index + 1}. {modulo.titulo}
              </span>
            </div>
            {modulo.completado ? (
              <div className='mt-2'>
                <ProgressBar
                  value={100}
                  className='bg-gray-200'
                  barClassName='bg-violet-500'
                />
              </div>
            ) : modulo.enProgreso ? (
              <div className='mt-2'>
                <ProgressBar
                  value={
                    (modulo.leccionesCompletadas / modulo.totalLecciones) * 100
                  }
                  className='bg-gray-200'
                  barClassName='bg-violet-500'
                />
              </div>
            ) : (
              <p className='mt-1 text-xs text-[var(--color-text-muted)]'>
                {t('bloqueada')}
              </p>
            )}
          </div>
        ))}
      </div>
    </aside>
  );
}
