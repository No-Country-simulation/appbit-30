'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { AppButton } from '@/src/components/app/AppButton';
import { ChoiceChip } from '@/src/components/app/ChoiceChip';

interface Props {
  onSubmit: (data: { mensaje: string; usarCvGuardado: boolean }) => void;
}

export function PostulationForm({ onSubmit }: Props) {
  const t = useTranslations('Empleabilidad');
  const [mensaje, setMensaje] = useState('');
  const [usarCvGuardado, setUsarCvGuardado] = useState(true);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSubmit({ mensaje, usarCvGuardado });
  }

  return (
    <form onSubmit={handleSubmit} className='space-y-4'>
      <div>
        <label className='mb-1 block text-sm font-medium text-[var(--color-text)]'>
          {t('mensajeReclutador')}
        </label>
        <textarea
          value={mensaje}
          onChange={(e) => setMensaje(e.target.value)}
          className='w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] p-3 text-sm text-[var(--color-text)] outline-none transition-colors focus:border-[var(--color-primary)]'
          rows={4}
        />
      </div>

      <ChoiceChip
        label={t('usarCvGuardado')}
        selected={usarCvGuardado}
        onClick={() => setUsarCvGuardado(!usarCvGuardado)}
      />

      <AppButton type='submit' variant='primary' className='w-full'>
        {t('enviarPostulacion')}
      </AppButton>
    </form>
  );
}
