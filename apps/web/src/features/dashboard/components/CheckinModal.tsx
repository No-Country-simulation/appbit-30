'use client';

import { useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { useRouter } from '@/src/i18n/navigation';
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
import { BotIcon, CheckIcon, InfoIcon, SparklesIcon } from 'lucide-react';
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

interface CheckinWellbeingResult {
  nota_actual: number;
  nota_semanal: number;
  mensaje: string;
  accion_sugerida: string;
  derivar_cvv: boolean;
  alerta: boolean;
  source?: 'ai' | 'fallback';
}

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
  const router = useRouter();
  const locale = useLocale();

  const initialStep = startAtStep ?? (initialMood ? 2 : 1);

  const [step, setStep] = useState<1 | 2 | 3>(initialStep);
  const [selectedMood, setSelectedMood] = useState<string>(initialMood ?? '');
  const [selectedMotivos, setSelectedMotivos] = useState<string[]>([]);
  const [contexto, setContexto] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [wellbeingResult, setWellbeingResult] =
    useState<CheckinWellbeingResult | null>(null);

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
    setWellbeingResult(null);
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
          'x-locale': locale,
        },
        body: JSON.stringify({
          emoji: selectedMood,
          motivos: selectedMotivos,
          contexto: contexto.trim() || undefined,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        }),
      });

      const result = await response.json().catch(() => null);

      if (!response.ok || !result?.success) {
        throw new Error(result?.message ?? 'No pudimos guardar el check-in.');
      }

      onComplete?.({
        mood: selectedMood,
        motivos: selectedMotivos,
        contexto,
      });

      if (result?.wellbeing) {
        setWellbeingResult(result.wellbeing);
      } else {
        setWellbeingResult({
          nota_actual: 0,
          nota_semanal: 0,
          mensaje: t('checkinFallbackMessage'),
          accion_sugerida: t('checkinFallbackAction'),
          derivar_cvv: false,
          alerta: false,
          source: 'fallback',
        });
      }

      await onSaved?.();
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

  function renderResultScreen() {
    if (!wellbeingResult) return null;

    return (
      <div className='min-w-0 space-y-4 text-center'>
        <div className='mx-auto flex size-14 items-center justify-center rounded-full bg-[var(--color-primary-pale)] text-[var(--color-primary)]'>
          <BotIcon className='size-7' />
        </div>

        <div className='min-w-0'>
          <h3 className='break-words text-base font-bold leading-tight text-[var(--color-text)]'>
            {wellbeingResult.source === 'ai'
              ? t('checkinAiResultTitle')
              : t('checkinFallbackResultTitle')}
          </h3>

          {wellbeingResult.source === 'ai' && (
            <p className='mt-2 break-words text-sm leading-relaxed text-[var(--color-text-muted)]'>
              {wellbeingResult.mensaje}
            </p>
          )}
        </div>

        <div className='min-w-0 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-body)] p-4 text-left'>
          <div className='flex min-w-0 items-start gap-2'>
            <SparklesIcon className='mt-0.5 size-4 shrink-0 text-[var(--color-primary)]' />

            <div className='min-w-0'>
              <p className='text-xs font-bold uppercase tracking-wide text-[var(--color-text-muted)]'>
                {t('checkinSuggestedAction')}
              </p>

              <p className='mt-1 break-words text-sm leading-relaxed text-[var(--color-text)]'>
                {wellbeingResult.accion_sugerida}
              </p>
            </div>
          </div>
        </div>

        {wellbeingResult.derivar_cvv && (
          <div className='min-w-0 rounded-[var(--radius-md)] border border-[var(--color-danger)] bg-[var(--color-danger-bg)] p-3 text-left text-sm leading-relaxed text-[var(--color-danger-text)]'>
            {t('checkinUrgentHelpHint')}
          </div>
        )}
      </div>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className='safe-modal-content w-[min(calc(100vw-1rem),34rem)] p-0'>
        <div className='shrink-0 border-b border-[var(--color-border)] px-4 py-4 sm:px-6'>
          <DialogHeader className='text-left'>
            <DialogTitle className='break-words leading-tight'>
              {wellbeingResult ? t('checkinSavedTitle') : t('checkinTitle')}
            </DialogTitle>

            {!wellbeingResult && (
              <DialogDescription className='break-words leading-relaxed'>
                {t('checkinDesc')}
              </DialogDescription>
            )}
          </DialogHeader>
        </div>

        <div className='min-w-0 flex-1 overflow-y-auto overflow-x-hidden px-4 py-4 sm:px-6'>
          <div className='flex min-w-0 flex-col gap-5'>
            {wellbeingResult ? (
              renderResultScreen()
            ) : (
              <>
                <div className='min-w-0 overflow-hidden'>
                  <StepIndicator
                    currentStep={step}
                    totalSteps={3}
                    labels={stepLabels}
                  />
                </div>

                {submitError && (
                  <div className='min-w-0 break-words rounded-[var(--radius-md)] border border-[var(--color-danger)] bg-[var(--color-danger-bg)] px-3 py-2 text-sm leading-relaxed text-[var(--color-danger-text)]'>
                    {submitError}
                  </div>
                )}

                {step === 1 && (
                  <div className='grid min-w-0 grid-cols-5 gap-1 sm:gap-2'>
                    {moods.map((mood) => {
                      const isSelected = selectedMood === mood.id;

                      return (
                        <button
                          key={mood.id}
                          type='button'
                          onClick={() => handleMoodSelect(mood.id)}
                          disabled={isSubmitting}
                          className={cn(
                            'flex min-w-0 flex-col items-center gap-1 rounded-[var(--radius-md)] px-1 py-2 text-center transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-60',
                            isSelected
                              ? 'bg-[var(--color-primary-pale)] ring-2 ring-[var(--color-primary)]'
                              : 'hover:bg-[var(--color-body)]',
                          )}
                        >
                          <span className='text-2xl'>{mood.emoji}</span>

                          <span
                            className={cn(
                              'max-w-full truncate text-[10px] font-medium sm:text-xs',
                              isSelected
                                ? 'text-[var(--color-primary)]'
                                : 'text-[var(--color-text-muted)]',
                            )}
                          >
                            {t(mood.key)}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}

                {step === 2 && (
                  <div className='min-w-0 space-y-3'>
                    {currentMotivos.map((motivo) => {
                      const isSelected = selectedMotivos.includes(motivo.id);

                      return (
                        <button
                          key={motivo.id}
                          type='button'
                          disabled={isSubmitting}
                          onClick={() => toggleMotivo(motivo.id)}
                          className={cn(
                            'flex w-full min-w-0 cursor-pointer items-start gap-3 rounded-[var(--radius-md)] border px-3 py-3 text-left transition-colors disabled:cursor-not-allowed disabled:opacity-60 sm:px-4',
                            isSelected
                              ? 'border-[var(--color-primary)] bg-[var(--color-primary-pale)]'
                              : 'border-[var(--color-border)] hover:border-[var(--color-primary)]/40',
                          )}
                        >
                          <div
                            className={cn(
                              'mt-0.5 flex size-5 shrink-0 items-center justify-center rounded border-2 transition-colors',
                              isSelected
                                ? 'border-[var(--color-primary)] bg-[var(--color-primary)]'
                                : 'border-[var(--color-border)]',
                            )}
                          >
                            {isSelected && (
                              <CheckIcon className='size-3 text-white' />
                            )}
                          </div>

                          <span className='shrink-0 text-lg leading-none'>
                            {motivo.emoji}
                          </span>

                          <span className='min-w-0 break-words text-sm font-medium leading-snug text-[var(--color-text)]'>
                            {t(motivo.key)}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}

                {step === 3 && (
                  <div className='min-w-0 space-y-4'>
                    <div className='min-w-0'>
                      <div className='flex min-w-0 items-center gap-2'>
                        <label className='min-w-0 break-words text-sm font-medium text-[var(--color-text)]'>
                          {t('contextoLabel')}
                        </label>

                        <InfoIcon className='size-4 shrink-0 text-[var(--color-text-muted)]' />
                      </div>

                      <p className='mt-1 break-words text-xs leading-relaxed text-[var(--color-text-muted)]'>
                        {t('contextoTooltip')}
                      </p>
                    </div>

                    <textarea
                      placeholder={t('contextoPlaceholder')}
                      value={contexto}
                      disabled={isSubmitting}
                      maxLength={500}
                      onChange={(event) => {
                        setSubmitError(null);
                        setContexto(event.target.value);
                      }}
                      className='block min-h-28 w-full min-w-0 max-w-full resize-none rounded-[8px] border border-[var(--color-input-border)] bg-[var(--color-card)] px-3 py-2 font-body text-base leading-relaxed text-[var(--color-text)] outline-none transition-colors focus:border-[var(--color-primary)] focus:ring-[3px] focus:ring-[var(--color-input-focus-ring)] disabled:cursor-not-allowed disabled:opacity-60 sm:text-sm'
                    />

                    <p className='text-right text-xs text-[var(--color-text-muted)]'>
                      {contexto.length}/500
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        <DialogFooter className='border-t border-[var(--color-border)] px-4 py-4 sm:px-6'>
          {wellbeingResult ? (
            <div className='flex w-full min-w-0 flex-col-reverse gap-2 sm:flex-row sm:justify-end'>
              <AppButton
                variant='outline'
                className='w-full sm:w-auto'
                onClick={() => handleClose(false)}
              >
                {t('cerrar')}
              </AppButton>

              <AppButton
                variant='primary'
                className='w-full sm:w-auto'
                onClick={() => {
                  handleClose(false);
                  router.push('/bienestar');
                }}
              >
                {t('verBienestar')}
              </AppButton>
            </div>
          ) : (
            <div className='flex w-full min-w-0 flex-col-reverse gap-2 sm:flex-row sm:justify-end'>
              {step > 1 && (
                <AppButton
                  variant='outline'
                  className='w-full sm:w-auto'
                  onClick={handleBack}
                  disabled={isSubmitting}
                >
                  {t('atras')}
                </AppButton>
              )}

              {step < 3 ? (
                <AppButton
                  variant='primary'
                  className='w-full sm:w-auto'
                  disabled={isSubmitting || (step === 1 && !selectedMood)}
                  onClick={handleNext}
                >
                  {t('siguiente')}
                </AppButton>
              ) : (
                <AppButton
                  variant='primary'
                  className='w-full sm:w-auto'
                  disabled={isSubmitting || !selectedMood}
                  onClick={handleGuardar}
                >
                  {isSubmitting ? t('guardando') : t('guardar')}
                </AppButton>
              )}
            </div>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
