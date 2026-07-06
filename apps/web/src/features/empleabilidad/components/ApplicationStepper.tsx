'use client';

import { useTranslations } from 'next-intl';

type Estado = 'Enviada' | 'Vista' | 'En_revision' | 'Rechazada' | 'Aceptada' | 'Cerrado';

const STEPS = ['Enviada', 'Vista', 'En_revision'] as const;

function getStepIndex(estado: Estado): number {
  if (estado === 'Enviada') return 0;
  if (estado === 'Vista') return 1;
  if (estado === 'En_revision') return 2;
  return 3;
}

interface Props {
  estadoActual: Estado;
}

export function ApplicationStepper({ estadoActual }: Props) {
  const t = useTranslations('Empleabilidad');
  const currentIndex = getStepIndex(estadoActual);
  const isRejected = estadoActual === 'Rechazada';
  const isAccepted = estadoActual === 'Aceptada';
  const isClosed = estadoActual === 'Cerrado';
  const decisionActive = currentIndex === 3;

  return (
    <div className='flex items-center'>
      {STEPS.map((step, i) => {
        const completed = i < currentIndex;
        const active = i === currentIndex && !isRejected && !isAccepted && !isClosed;

        return (
          <div key={step} className='flex items-center flex-1'>
            <div className='flex flex-col items-center'>
              <div
                className={`flex size-8 items-center justify-center rounded-full text-sm font-bold transition-colors ${
                  completed
                    ? 'bg-[var(--color-success)] text-white'
                    : active
                      ? 'bg-[var(--color-primary)] text-white'
                      : 'border-2 border-[var(--color-border)] bg-[var(--color-card)] text-[var(--color-text-muted)]'
                }`}
              >
                {completed ? '✓' : i + 1}
              </div>
              <span
                className={`mt-1 text-xs ${
                  completed || active
                    ? 'font-medium text-[var(--color-text)]'
                    : 'text-[var(--color-text-muted)]'
                }`}
              >
                {t(`estado${step}` as any)}
              </span>
            </div>

            {i < STEPS.length - 1 && (
              <div
                className={`mx-2 h-0.5 flex-1 transition-colors ${
                  completed ? 'bg-[var(--color-success)]' : 'bg-[var(--color-border)]'
                }`}
              />
            )}
          </div>
        );
      })}

      <div className='mx-2 h-0.5 flex-1 bg-[var(--color-border)]' />

      <div className='flex flex-col items-center'>
        <div
          className={`flex size-8 items-center justify-center rounded-full text-sm font-bold transition-colors ${
            decisionActive
              ? isRejected
                ? 'bg-[var(--color-danger)] text-white'
                : isAccepted
                  ? 'bg-[var(--color-success)] text-white'
                  : 'bg-[var(--color-primary)] text-white'
              : isClosed
                ? 'border-2 border-[var(--color-border)] bg-[var(--color-card)] text-[var(--color-text-muted)]'
                : 'border-2 border-[var(--color-border)] bg-[var(--color-card)] text-[var(--color-text-muted)]'
          }`}
        >
          {isAccepted ? '✓' : isRejected ? '✗' : decisionActive ? '!' : '?'}
        </div>
        <span
          className={`mt-1 text-xs ${
            decisionActive
              ? isRejected
                ? 'font-medium text-[var(--color-danger)]'
                : isAccepted
                  ? 'font-medium text-[var(--color-success)]'
                  : 'font-medium text-[var(--color-primary)]'
              : 'text-[var(--color-text-muted)]'
          }`}
        >
          {decisionActive
            ? isRejected
              ? t('noSeleccionado')
              : t('estadoAceptada')
            : isClosed
              ? t('estadoCerrado')
              : 'Decisión'}
        </span>
      </div>
    </div>
  );
}
