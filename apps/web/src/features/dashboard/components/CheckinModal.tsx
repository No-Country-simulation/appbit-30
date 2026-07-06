'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/src/components/ui/dialog';
import { StepIndicator } from '@/src/components/app/StepIndicator';
import { AppButton } from '@/src/components/app/AppButton';
import { AppInput } from '@/src/components/app/AppInput';
import { CheckIcon, InfoIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

const moods = [
  { id: 'agotado', key: 'moodAgotado', emoji: '😩' },
  { id: 'triste', key: 'moodTriste', emoji: '😢' },
  { id: 'neutral', key: 'moodNeutral', emoji: '😐' },
  { id: 'bien', key: 'moodBien', emoji: '🙂' },
  { id: 'genial', key: 'moodGenial', emoji: '😄' },
];

const motivosPorMood: Record<
  string,
  { id: string; key: string; emoji: string }[]
> = {
  agotado: [
    { id: 'sobrecarga', key: 'motivoAgotado1', emoji: '😰' },
    { id: 'sin-tiempo', key: 'motivoAgotado2', emoji: '⏰' },
    { id: 'sin-avanzar', key: 'motivoAgotado3', emoji: '😔' },
  ],
  triste: [
    { id: 'mal-entrevista', key: 'motivoTriste1', emoji: '😞' },
    { id: 'rechazo', key: 'motivoTriste2', emoji: '💔' },
    { id: 'sin-motivacion', key: 'motivoTriste3', emoji: '😢' },
  ],
  neutral: [
    { id: 'dia-normal', key: 'motivoNeutral1', emoji: '😐' },
    { id: 'pensando-futuro', key: 'motivoNeutral2', emoji: '🤔' },
  ],
  bien: [
    { id: 'buena-entrevista', key: 'motivoBien1', emoji: '😊' },
    { id: 'avance-curso', key: 'motivoBien2', emoji: '📚' },
    { id: 'logro-diario', key: 'motivoBien3', emoji: '✅' },
  ],
  genial: [
    { id: 'nuevo-trabajo', key: 'motivoGenial1', emoji: '🎉' },
    { id: 'logro-importante', key: 'motivoGenial2', emoji: '🏆' },
    { id: 'muy-motivado', key: 'motivoGenial3', emoji: '🔥' },
  ],
};

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialMood?: string;
  startAtStep?: 1 | 2 | 3;
  onSaved?: () => void | Promise<void>;
  onComplete?: (data: {
    mood: string;
    motivos: string[];
    contexto: string;
  }) => void;
}

export function CheckinModal({
  open,
  onOpenChange,
  initialMood,
  startAtStep,
  onSaved,
  onComplete,
}: Props) {
  const t = useTranslations('Dashboard');

  const initialStep = startAtStep ?? (initialMood ? 2 : 1);

  const [step, setStep] = useState<1 | 2 | 3>(initialStep);
  const [selectedMood, setSelectedMood] = useState<string>(initialMood ?? '');
  const [selectedMotivos, setSelectedMotivos] = useState<string[]>([]);
  const [contexto, setContexto] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const stepLabels = [
    t('checkinStepEstado'),
    t('checkinStepMotivo'),
    t('checkinStepContexto'),
  ];

  const currentMotivos = selectedMood
    ? (motivosPorMood[selectedMood] ?? [])
    : [];

  function resetState() {
    setStep(startAtStep ?? (initialMood ? 2 : 1));
    setSelectedMood(initialMood ?? '');
    setSelectedMotivos([]);
    setContexto('');
    setSubmitError(null);
    setIsSubmitting(false);
  }

  function handleClose(nextOpen: boolean) {
    if (isSubmitting) {
      return;
    }

    if (!nextOpen) {
      resetState();
    }

    onOpenChange(nextOpen);
  }

  function handleMoodSelect(moodId: string) {
    setSelectedMood(moodId);
    setSelectedMotivos([]);
    setSubmitError(null);
  }

  function handleNext() {
    if (step === 1 && selectedMood) {
      setStep(2);
      return;
    }

    if (step === 2) {
      setStep(3);
    }
  }

  function handleBack() {
    if (step === 3) {
      setStep(2);
      return;
    }

    if (step === 2) {
      setStep(1);
    }
  }

  function toggleMotivo(id: string) {
    setSubmitError(null);

    setSelectedMotivos((prev) =>
      prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id],
    );
  }

  async function handleGuardar() {
    if (!selectedMood || isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const response = await fetch('/api/checkins', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          emoji: selectedMood,
          motivos: selectedMotivos,
          contexto: contexto.trim() || undefined,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message ?? 'No pudimos guardar el check-in.');
      }

      onComplete?.({
        mood: selectedMood,
        motivos: selectedMotivos,
        contexto,
      });

      await onSaved?.();

      resetState();
      onOpenChange(false);
    } catch (error) {
      setSubmitError(
        error instanceof Error
          ? error.message
          : 'No pudimos guardar el check-in.',
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>{t('checkinTitle')}</DialogTitle>
          <DialogDescription>{t('checkinDesc')}</DialogDescription>
        </DialogHeader>

        <div className='flex flex-col gap-6 py-4'>
          <StepIndicator
            currentStep={step}
            totalSteps={3}
            labels={stepLabels}
          />

          {submitError && (
            <div className='rounded-[var(--radius-md)] border border-[var(--color-danger)] bg-[var(--color-danger-bg)] px-3 py-2 text-sm text-[var(--color-danger-text)]'>
              {submitError}
            </div>
          )}

          {step === 1 && (
            <div className='flex justify-between px-2'>
              {moods.map((mood) => (
                <button
                  key={mood.id}
                  type='button'
                  onClick={() => handleMoodSelect(mood.id)}
                  disabled={isSubmitting}
                  className={cn(
                    'flex flex-col items-center gap-1 rounded-[var(--radius-md)] px-3 py-2 transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-60',
                    selectedMood === mood.id
                      ? 'scale-110 bg-[var(--color-primary-pale)]'
                      : 'hover:bg-[var(--color-body)]',
                  )}
                >
                  <span className='text-2xl'>{mood.emoji}</span>
                  <span
                    className={cn(
                      'text-[10px] font-medium',
                      selectedMood === mood.id
                        ? 'text-[var(--color-primary)]'
                        : 'text-[var(--color-text-muted)]',
                    )}
                  >
                    {t(mood.key)}
                  </span>
                </button>
              ))}
            </div>
          )}

          {step === 2 && (
            <div className='space-y-3'>
              {currentMotivos.map((motivo) => (
                <button
                  key={motivo.id}
                  type='button'
                  disabled={isSubmitting}
                  onClick={() => toggleMotivo(motivo.id)}
                  className={cn(
                    'flex w-full cursor-pointer items-center gap-3 rounded-[var(--radius-md)] border px-4 py-3 text-left transition-colors disabled:cursor-not-allowed disabled:opacity-60',
                    selectedMotivos.includes(motivo.id)
                      ? 'border-[var(--color-primary)] bg-[var(--color-primary-pale)]'
                      : 'border-[var(--color-border)] hover:border-[var(--color-primary)]/40',
                  )}
                >
                  <div
                    className={cn(
                      'flex size-5 shrink-0 items-center justify-center rounded border-2 transition-colors',
                      selectedMotivos.includes(motivo.id)
                        ? 'border-[var(--color-primary)] bg-[var(--color-primary)]'
                        : 'border-[var(--color-border)]',
                    )}
                  >
                    {selectedMotivos.includes(motivo.id) && (
                      <CheckIcon className='size-3 text-white' />
                    )}
                  </div>
                  <span className='text-lg'>{motivo.emoji}</span>
                  <span className='text-sm font-medium text-[var(--color-text)]'>
                    {t(motivo.key)}
                  </span>
                </button>
              ))}
            </div>
          )}

          {step === 3 && (
            <div className='space-y-6'>
              <div className='flex items-center gap-2'>
                <label className='text-sm font-medium text-[var(--color-text)]'>
                  {t('contextoLabel')}
                </label>
                <div className='group relative'>
                  <InfoIcon className='size-4 cursor-help text-[var(--color-text-muted)]' />
                  <div className='absolute bottom-full left-1/2 z-10 mb-2 w-56 -translate-x-1/2 rounded-[var(--radius-md)] bg-[var(--color-text)] px-3 py-2 text-xs text-[var(--color-card)] opacity-0 shadow-lg transition-opacity group-hover:opacity-100'>
                    {t('contextoTooltip')}
                  </div>
                </div>
              </div>

              <AppInput
                placeholder={t('contextoPlaceholder')}
                value={contexto}
                disabled={isSubmitting}
                onChange={(e) => {
                  setSubmitError(null);
                  setContexto(e.target.value);
                }}
              />
            </div>
          )}
        </div>

        <DialogFooter>
          {step > 1 && (
            <AppButton
              variant='outline'
              onClick={handleBack}
              disabled={isSubmitting}
            >
              {t('atras')}
            </AppButton>
          )}

          {step < 3 ? (
            <AppButton
              variant='primary'
              className='w-full'
              disabled={isSubmitting || (step === 1 && !selectedMood)}
              onClick={handleNext}
            >
              {t('siguiente')}
            </AppButton>
          ) : (
            <AppButton
              variant='primary'
              className='w-full'
              disabled={isSubmitting || !selectedMood}
              onClick={handleGuardar}
            >
              {isSubmitting ? 'Guardando...' : t('guardar')}
            </AppButton>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
