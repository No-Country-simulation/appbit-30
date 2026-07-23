'use client';

import { useTranslations } from 'next-intl';
import type { PostulacionEstado } from '../types';

const STEP_TRANSLATION_KEYS: Record<string, string> = {
  Enviada: 'estadoEnviada',
  Vista: 'estadoVista',
  En_proceso: 'estadoEnRevision',
};

function getStepIndex(estado: PostulacionEstado): number {
  if (estado === 'Enviada') return 0;
  if (estado === 'Vista') return 1;
  if (estado === 'En_proceso') return 2;
  return 3;
}

interface Props {
  estadoActual: PostulacionEstado;
}

export function ApplicationStepper({ estadoActual }: Props) {
  const t = useTranslations('Empleabilidad');

  const currentIndex = getStepIndex(estadoActual);
  const isRejected = estadoActual === 'Rechazada';
  const isAccepted = estadoActual === 'Aceptada';

  const items = [
    {
      id: 'Enviada',
      label: t(STEP_TRANSLATION_KEYS.Enviada),
      state: getVisualState(0, currentIndex, estadoActual),
      symbol: '1',
    },
    {
      id: 'Vista',
      label: t(STEP_TRANSLATION_KEYS.Vista),
      state: getVisualState(1, currentIndex, estadoActual),
      symbol: '2',
    },
    {
      id: 'En_proceso',
      label: t(STEP_TRANSLATION_KEYS.En_proceso),
      state: getVisualState(2, currentIndex, estadoActual),
      symbol: '3',
    },
    {
      id: 'Decision',
      label: isRejected
        ? t('noSeleccionado')
        : isAccepted
          ? t('estadoAceptada')
          : t('decision'),
      state: getDecisionState(estadoActual),
      symbol: isAccepted ? '✓' : isRejected ? '✕' : '?',
    },
  ];

  return (
    <div className='w-full min-w-0'>
      <div className='grid min-w-0 grid-cols-4 gap-1 sm:gap-2'>
        {items.map((item, index) => (
          <div key={item.id} className='relative min-w-0'>
            {index > 0 && (
              <div
                className={`absolute right-1/2 top-4 h-0.5 w-full ${
                  isConnectorActive(index, currentIndex, estadoActual)
                    ? 'bg-[var(--color-success)]'
                    : 'bg-[var(--color-border)]'
                }`}
              />
            )}

            <div className='relative z-10 flex min-w-0 flex-col items-center'>
              <div
                className={`flex size-8 items-center justify-center rounded-full text-sm font-bold transition-colors ${getCircleClasses(
                  item.state,
                )}`}
              >
                {item.state === 'completed' ? '✓' : item.symbol}
              </div>

              <span
                className={`mt-1 w-full min-w-0 break-words px-0.5 text-center text-[10px] font-medium leading-tight sm:text-xs ${getLabelClasses(
                  item.state,
                )}`}
              >
                {item.label}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

type VisualState =
  | 'completed'
  | 'active'
  | 'pending'
  | 'accepted'
  | 'rejected'
  | 'closed';

function getVisualState(
  index: number,
  currentIndex: number,
  estado: PostulacionEstado,
): VisualState {
  if (estado === 'Rechazada' || estado === 'Aceptada') {
    return 'completed';
  }

  if (index < currentIndex) return 'completed';
  if (index === currentIndex) return 'active';

  return 'pending';
}

function getDecisionState(estado: PostulacionEstado): VisualState {
  if (estado === 'Aceptada') return 'accepted';
  if (estado === 'Rechazada') return 'rejected';

  return 'pending';
}

function isConnectorActive(
  index: number,
  currentIndex: number,
  estado: PostulacionEstado,
) {
  if (estado === 'Aceptada' || estado === 'Rechazada') {
    return true;
  }

  return index <= currentIndex;
}

function getCircleClasses(state: VisualState) {
  if (state === 'completed') {
    return 'bg-[var(--color-success)] text-white';
  }

  if (state === 'active') {
    return 'bg-[var(--color-primary)] text-white';
  }

  if (state === 'accepted') {
    return 'bg-[var(--color-success)] text-white';
  }

  if (state === 'rejected') {
    return 'bg-[var(--color-danger)] text-white';
  }

  if (state === 'closed') {
    return 'bg-[var(--color-border)] text-[var(--color-text-muted)]';
  }

  return 'border-2 border-[var(--color-border)] bg-[var(--color-card)] text-[var(--color-text-muted)]';
}

function getLabelClasses(state: VisualState) {
  if (state === 'completed' || state === 'active') {
    return 'text-[var(--color-text)]';
  }

  if (state === 'accepted') {
    return 'text-[var(--color-success-text)]';
  }

  if (state === 'rejected') {
    return 'text-[var(--color-danger)]';
  }

  return 'text-[var(--color-text-muted)]';
}
