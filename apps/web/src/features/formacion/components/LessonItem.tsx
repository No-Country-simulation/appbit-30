'use client';

import { useTranslations } from 'next-intl';
import { CheckCircle, PlayCircle, Lock, Clock, LoaderCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

type Estado = 'completada' | 'en_progreso' | 'proxima' | 'bloqueada';

interface Props {
  canComplete: boolean;
  numero: number;
  titulo: string;
  duracion: string;
  estado: Estado;
  onClick?: () => void;
  onComplete?: () => void;
  isCompleting?: boolean;
}

const estadoConfig: Record<Estado, { label: string; icon: typeof PlayCircle; color: string }> = {
  completada: { label: 'completada', icon: CheckCircle, color: 'text-[var(--color-success)]' },
  en_progreso: { label: 'enProgreso', icon: PlayCircle, color: 'text-[var(--color-primary)]' },
  proxima: { label: 'proxima', icon: Clock, color: 'text-[var(--color-text-muted)]' },
  bloqueada: { label: 'bloqueada', icon: Lock, color: 'text-[var(--color-text-muted)]' },
};

export function LessonItem({
  canComplete,
  numero,
  titulo,
  duracion,
  estado,
  onClick,
  onComplete,
  isCompleting = false,
}: Props) {
  const t = useTranslations('Formacion');
  const config = estadoConfig[estado];
  const Icon = config.icon;

  return (
    <div
      className={cn(
        'flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left transition-colors',
        estado === 'en_progreso'
          ? 'bg-[var(--color-primary-pale)]'
          : 'hover:bg-[var(--color-primary-pale)]',
        estado === 'bloqueada' && 'opacity-50',
      )}
    >
      <Icon className={cn('size-5 shrink-0', config.color)} />

      <button
        type='button'
        onClick={estado !== 'bloqueada' ? onClick : undefined}
        disabled={estado === 'bloqueada'}
        className='min-w-0 flex-1 text-left'
      >
        <span className='text-xs text-[var(--color-text-muted)]'>
          {t('leccion')} {numero}
        </span>
        <p className='truncate text-sm font-medium text-[var(--color-text)]'>{titulo}</p>
      </button>

      <div className='flex items-center gap-2'>
        <span className='text-xs text-[var(--color-text-muted)]'>{duracion}</span>
        <span className={cn('text-xs font-medium', config.color)}>{t(config.label)}</span>
        {canComplete && estado !== 'completada' && estado !== 'bloqueada' && (
          <button
            type='button'
            onClick={onComplete}
            disabled={isCompleting}
            aria-label={t('marcarCompletada')}
            title={t('marcarCompletada')}
            className='inline-flex size-8 items-center justify-center rounded-full border border-[var(--color-primary)] text-[var(--color-primary)] transition-colors hover:bg-[var(--color-primary-pale)] disabled:cursor-wait disabled:opacity-60'
          >
            {isCompleting ? (
              <LoaderCircle className='size-4 animate-spin' />
            ) : (
              <CheckCircle className='size-4' />
            )}
          </button>
        )}
      </div>
    </div>
  );
}
