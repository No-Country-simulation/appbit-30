'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Cloud, Send } from 'lucide-react';
import { AppButton } from '@/src/components/app/AppButton';

interface Props {
  onSubmit: (data: { mensaje_motivacion: string; usar_cv_guardado: boolean }) => void;
}

export function PostulationForm({ onSubmit }: Props) {
  const t = useTranslations('Empleabilidad');
  const [mensaje, setMensaje] = useState('');
  const [usarCvGuardado, setUsarCvGuardado] = useState(true);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSubmit({ mensaje_motivacion: mensaje, usar_cv_guardado: usarCvGuardado });
  }

  return (
    <form onSubmit={handleSubmit} className='space-y-5'>
      <div>
        <label className='mb-2 block text-sm font-semibold text-[var(--color-text)]'>
          {t('porQueInteresa')}
        </label>
        <textarea
          value={mensaje}
          onChange={(e) => setMensaje(e.target.value)}
          placeholder={t('placeholderMensaje')}
          className='w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] p-3 text-sm text-[var(--color-text)] outline-none transition-colors focus:border-[var(--color-primary)]'
          rows={4}
        />
      </div>

      <div>
        <label className='mb-2 block text-sm font-semibold text-[var(--color-text)]'>
          {t('curriculumVitae')}
        </label>
        <button
          type='button'
          onClick={() => setUsarCvGuardado(!usarCvGuardado)}
          className={`flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed px-4 py-3 text-sm font-medium transition-colors ${
            usarCvGuardado
              ? 'border-[var(--color-primary)] bg-[var(--color-primary-pale)] text-[var(--color-primary)]'
              : 'border-[var(--color-border)] bg-[var(--color-card)] text-[var(--color-text-muted)] hover:border-[var(--color-primary-light)]'
          }`}
        >
          <Cloud className='size-4' />
          {t('usarCvGuardado')}
        </button>
      </div>

      <AppButton type='submit' variant='primary' className='inline-flex w-full items-center justify-center gap-2'>
        <Send className='size-4' />
        {t('enviarPostulacion')}
      </AppButton>
    </form>
  );
}
