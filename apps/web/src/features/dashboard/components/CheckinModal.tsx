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
  onComplete,
}: Props) {
  const t = useTranslations('Dashboard');
  const initialStep = startAtStep ?? (initialMood ? 2 : 1);
  const [step, setStep] = useState<1 | 2 | 3>(initialStep);
  const [selectedMood, setSelectedMood] = useState<string>(initialMood ?? '');
  const [selectedMotivos, setSelectedMotivos] = useState<string[]>([]);
  const [contexto, setContexto] = useState<string>('');

  const stepLabels = [
    t('checkinStepEstado'),
    t('checkinStepMotivo'),
    t('checkinStepContexto'),
  ];

  function handleNext() {
    if (step === 1 && selectedMood) setStep(2);
    else if (step === 2) setStep(3);
  }

  function handleBack() {
    if (step === 3) setStep(2);
    else if (step === 2) setStep(1);
  }

  function toggleMotivo(id: string) {
    setSelectedMotivos((prev) =>
      prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id],
    );
  }

  function handleGuardar() {
    onComplete?.({
      mood: selectedMood,
      motivos: selectedMotivos,
      contexto,
    });
    resetState();
    onOpenChange(false);
  }

  function resetState() {
    setStep(startAtStep ?? (initialMood ? 2 : 1));
    setSelectedMood('');
    setSelectedMotivos([]);
    setContexto('');
  }

  function handleClose(v: boolean) {
    if (!v) resetState();
    onOpenChange(v);
  }

  const currentMotivos = selectedMood
    ? (motivosPorMood[selectedMood] ?? [])
    : [];

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

          {step === 1 && (
            <div className='flex justify-between px-2'>
              {moods.map((mood) => (
                <button
                  key={mood.id}
                  type='button'
                  onClick={() => setSelectedMood(mood.id)}
                  className={cn(
                    'flex flex-col items-center gap-1 rounded-[var(--radius-md)] px-3 py-2 transition-all duration-200',
                    selectedMood === mood.id
                      ? 'bg-[var(--color-primary-pale)] scale-110'
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
                <label
                  key={motivo.id}
                  onClick={() => toggleMotivo(motivo.id)}
                  className={cn(
                    'flex items-center gap-3 rounded-[var(--radius-md)] border px-4 py-3 transition-colors cursor-pointer',
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
                </label>
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
                onChange={(e) => setContexto(e.target.value)}
              />
            </div>
          )}
        </div>

        <DialogFooter>
          {step > 1 && (
            <AppButton variant='outline' onClick={handleBack}>
              {t('atras')}
            </AppButton>
          )}

          {step < 3 ? (
            <AppButton
              variant='primary'
              className='w-full'
              disabled={step === 1 && !selectedMood}
              onClick={handleNext}
            >
              {t('siguiente')}
            </AppButton>
          ) : (
            <AppButton
              variant='primary'
              className='w-full'
              onClick={handleGuardar}
            >
              {t('guardar')}
            </AppButton>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
