'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Plus } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogFooter,
} from '@/src/components/ui/dialog';
import { AppInput } from '@/src/components/app/AppInput';
import { AppButton } from '@/src/components/app/AppButton';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: {
    skills: string;
    experiencia: string;
    disponibilidad: string;
  }) => void;
}

export function BeMentorModal({ open, onOpenChange, onSubmit }: Props) {
  const t = useTranslations('Mentoria');
  const [skills, setSkills] = useState('');
  const [experiencia, setExperiencia] = useState('');
  const [disponibilidad, setDisponibilidad] = useState('');

  function resetForm() {
    setSkills('');
    setExperiencia('');
    setDisponibilidad('');
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    onSubmit({
      skills: skills.trim(),
      experiencia: experiencia.trim(),
      disponibilidad: disponibilidad.trim(),
    });

    resetForm();
    onOpenChange(false);
  }

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen) {
      resetForm();
    }

    onOpenChange(nextOpen);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className='safe-modal-content w-[min(calc(100vw-1rem),32rem)] p-0'>
        <form onSubmit={handleSubmit} className='flex min-w-0 flex-col'>
          <div className='min-w-0 border-b border-[var(--color-border)] px-4 pb-4 pt-5 text-center sm:px-6'>
            <div className='mx-auto mb-3 flex size-14 items-center justify-center rounded-full bg-violet-100'>
              <Plus className='size-7 text-violet-600' />
            </div>

            <h2 className='break-words text-base font-bold leading-tight text-[var(--color-text)] sm:text-lg'>
              {t('seUnMentor')}
            </h2>

            <p className='mx-auto mt-2 max-w-[26rem] break-words text-sm leading-relaxed text-[var(--color-text-muted)]'>
              {t('seUnMentorDesc')}
            </p>
          </div>

          <div className='min-w-0 space-y-4 px-4 py-4 sm:px-6'>
            <div className='min-w-0 space-y-1.5'>
              <label className='block text-sm font-medium text-[var(--color-text)]'>
                {t('tusSkills')}
              </label>

              <AppInput
                value={skills}
                onChange={(event) => setSkills(event.target.value)}
                placeholder='Ej: SQL, React, UX Research...'
              />
            </div>

            <div className='min-w-0 space-y-1.5'>
              <label className='block text-sm font-medium text-[var(--color-text)]'>
                {t('experiencia')}
              </label>

              <textarea
                value={experiencia}
                onChange={(event) => setExperiencia(event.target.value)}
                rows={4}
                placeholder={t('experienciaPlaceholder')}
                className='block min-h-28 w-full min-w-0 max-w-full resize-none rounded-[8px] border border-[var(--color-input-border)] bg-[var(--color-card)] px-3 py-2 font-body text-base leading-relaxed text-[var(--color-text)] outline-none transition-colors focus:border-[var(--color-primary)] focus:ring-[3px] focus:ring-[var(--color-input-focus-ring)] sm:text-sm'
              />
            </div>

            <div className='min-w-0 space-y-1.5'>
              <label className='block text-sm font-medium text-[var(--color-text)]'>
                {t('disponibilidad')}
              </label>

              <AppInput
                value={disponibilidad}
                onChange={(event) => setDisponibilidad(event.target.value)}
                placeholder={t('disponibilidadPlaceholder')}
              />
            </div>
          </div>

          <DialogFooter className='border-t border-[var(--color-border)] px-4 py-4 sm:px-6'>
            <AppButton
              type='submit'
              variant='primary'
              className='w-full'
              disabled={
                !skills.trim() || !experiencia.trim() || !disponibilidad.trim()
              }
            >
              {t('enviarSolicitud')}
            </AppButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
