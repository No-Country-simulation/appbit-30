'use client';

import { useTranslations } from 'next-intl';

type Estado = 'Enviada' | 'Vista' | 'En_proceso' | 'Rechazada' | 'Aceptada';

const STEPS = ['Enviada', 'Vista', 'En_proceso'] as const;

function getStepIndex(estado: Estado): number {
  if (estado === 'Enviada') return 0;
  if (estado === 'Vista') return 1;
  if (estado === 'En_proceso') return 2;
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
  const decisionActive = currentIndex === 3;

  return (
    <div className='flex items-center'>
      {STEPS.map((step, i) => {
        const stepKey = step as keyof typeof t;
        const completed = i < currentIndex;
        const active = i === currentIndex;

        return (
          <div key={step} className='flex items-center flex-1'>
            <div className='flex flex-col items-center'>
              <div
                className={`flex size-8 items-center justify-center rounded-full text-sm font-bold transition-colors ${
                  completed || (active && !isRejected && !isAccepted)
                    ? 'bg-[var(--color-primary)] text-white'
                    : 'bg-[var(--color-border)] text-[var(--color-text-muted)]'
                }`}
              >
                {completed ? '✓' : i + 1}
              </div>
              <span
                className={`mt-1 text-xs ${
                  completed || active
                    ? 'text-[var(--color-primary)]'
                    : 'text-[var(--color-text-muted)]'
                }`}
              >
                {t(stepKey)}
              </span>
            </div>

            {i < STEPS.length - 1 && (
              <div
                className={`mx-2 h-0.5 flex-1 transition-colors ${
                  completed ? 'bg-[var(--color-primary)]' : 'bg-[var(--color-border)]'
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
                ? 'bg-[var(--color-danger-bg)] text-[var(--color-danger-text)]'
                : isAccepted
                  ? 'bg-[var(--color-success-bg)] text-[var(--color-success-text)]'
                  : 'bg-[var(--color-primary)] text-white'
              : 'bg-[var(--color-border)] text-[var(--color-text-muted)]'
          }`}
        >
          {isAccepted ? '✓' : isRejected ? '✗' : '?'}
        </div>
        <span
          className={`mt-1 text-xs ${
            decisionActive
              ? isRejected
                ? 'text-[var(--color-danger-text)]'
                : isAccepted
                  ? 'text-[var(--color-success-text)]'
                  : 'text-[var(--color-primary)]'
              : 'text-[var(--color-text-muted)]'
          }`}
        >
          {decisionActive
            ? isRejected
              ? t('estadoRechazada')
              : t('estadoAceptada')
            : 'Decisión'}
        </span>
      </div>
    </div>
  );
}
