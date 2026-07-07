'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Plus } from 'lucide-react';
import { Dialog, DialogContent } from '@/src/components/ui/dialog';
import { AppInput } from '@/src/components/app/AppInput';
import { AppButton } from '@/src/components/app/AppButton';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: { skills: string; experiencia: string; disponibilidad: string }) => void;
}

export function BeMentorModal({ open, onOpenChange, onSubmit }: Props) {
  const t = useTranslations('Mentoria');
  const [skills, setSkills] = useState('');
  const [experiencia, setExperiencia] = useState('');
  const [disponibilidad, setDisponibilidad] = useState('');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSubmit({ skills, experiencia, disponibilidad });
    setSkills('');
    setExperiencia('');
    setDisponibilidad('');
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-md p-6'>
        <div className='flex flex-col items-center text-center'>
          <div className='mb-5 flex size-14 items-center justify-center rounded-full bg-violet-100'>
            <Plus className='size-7 text-violet-600' />
          </div>

          <h2 className='text-lg font-bold text-[var(--color-text)]'>
            {t('seUnMentor')}
          </h2>
          <p className='mt-2 text-sm leading-relaxed text-[var(--color-text-muted)]'>
            {t('seUnMentorDesc')}
          </p>
        </div>

        <form onSubmit={handleSubmit} className='mt-6 space-y-5'>
          <div className='space-y-2'>
            <label className='text-sm font-medium text-[var(--color-text)]'>
              {t('tusSkills')}
            </label>
            <AppInput
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
              placeholder='Ej: SQL, React, UX Research...'
            />
          </div>

          <div className='space-y-2'>
            <label className='text-sm font-medium text-[var(--color-text)]'>
              {t('experiencia')}
            </label>
            <textarea
              value={experiencia}
              onChange={(e) => setExperiencia(e.target.value)}
              rows={4}
              placeholder={t('experienciaPlaceholder')}
              className='w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-card)] px-4 py-3 text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-pale)]'
            />
          </div>

          <div className='space-y-2'>
            <label className='text-sm font-medium text-[var(--color-text)]'>
              {t('disponibilidad')}
            </label>
            <AppInput
              value={disponibilidad}
              onChange={(e) => setDisponibilidad(e.target.value)}
              placeholder='Ej: Martes y jueves de 18 a 20hs'
            />
          </div>

          <AppButton
            type='submit'
            variant='primary'
            className='w-full'
            disabled={!skills.trim() || !experiencia.trim() || !disponibilidad.trim()}
          >
            {t('enviarSolicitud')}
          </AppButton>
        </form>
      </DialogContent>
    </Dialog>
  );
}
