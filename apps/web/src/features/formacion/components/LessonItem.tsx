'use client';

import { useTranslations } from 'next-intl';
import { CheckCircle, PlayCircle, Lock, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

type Estado = 'completada' | 'en_progreso' | 'proxima' | 'bloqueada';

interface Props {
  numero: number;
  titulo: string;
  duracion: string;
  estado: Estado;
  onClick?: () => void;
}

const estadoConfig: Record<Estado, { label: string; icon: typeof PlayCircle; color: string }> = {
  completada: { label: 'completada', icon: CheckCircle, color: 'text-[var(--color-success)]' },
  en_progreso: { label: 'enProgreso', icon: PlayCircle, color: 'text-[var(--color-primary)]' },
  proxima: { label: 'proxima', icon: Clock, color: 'text-[var(--color-text-muted)]' },
  bloqueada: { label: 'bloqueada', icon: Lock, color: 'text-[var(--color-text-muted)]' },
};

export function LessonItem({ numero, titulo, duracion, estado, onClick }: Props) {
  const t = useTranslations('Formacion');
  const config = estadoConfig[estado];
  const Icon = config.icon;

  return (
    <button
      onClick={estado !== 'bloqueada' ? onClick : undefined}
      disabled={estado === 'bloqueada'}
      className={cn(
        'flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left transition-colors',
        estado === 'en_progreso'
          ? 'bg-[var(--color-primary-pale)]'
          : 'hover:bg-[var(--color-primary-pale)]',
        estado === 'bloqueada' && 'cursor-not-allowed opacity-50',
      )}
    >
      <Icon className={cn('size-5 shrink-0', config.color)} />

      <div className='flex-1 min-w-0'>
        <span className='text-xs text-[var(--color-text-muted)]'>
          {t('leccion')} {numero}
        </span>
        <p className='truncate text-sm font-medium text-[var(--color-text)]'>{titulo}</p>
      </div>

      <div className='flex items-center gap-2'>
        <span className='text-xs text-[var(--color-text-muted)]'>{duracion}</span>
        <span className={cn('text-xs font-medium', config.color)}>{t(config.label)}</span>
      </div>
    </button>
  );
}
