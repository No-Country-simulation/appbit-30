'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Cloud, Send } from 'lucide-react';
import { AppButton } from '@/src/components/app/AppButton';

interface Props {
  onSubmit: (data: {
    mensaje_motivacion: string;
    usar_cv_guardado: boolean;
  }) => void;
}

export function PostulationForm({ onSubmit }: Props) {
  const t = useTranslations('Empleabilidad');
  const [mensaje, setMensaje] = useState('');
  const [usarCvGuardado, setUsarCvGuardado] = useState(true);

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    onSubmit({
      mensaje_motivacion: mensaje,
      usar_cv_guardado: usarCvGuardado,
    });

    setMensaje('');
  }

  return (
    <form onSubmit={handleSubmit} className='min-w-0 space-y-5'>
      <div className='min-w-0'>
        <label className='mb-2 block break-words text-sm font-semibold text-[var(--color-text)]'>
          {t('porQueInteresa')}
        </label>

        <textarea
          value={mensaje}
          onChange={(event) => setMensaje(event.target.value)}
          placeholder={t('placeholderMensaje')}
          rows={4}
          className='block min-h-28 w-full min-w-0 resize-none rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] p-3 text-base leading-relaxed text-[var(--color-text)] outline-none transition-colors placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-primary)] sm:text-sm'
        />
      </div>

      <div className='min-w-0'>
        <label className='mb-2 block break-words text-sm font-semibold text-[var(--color-text)]'>
          {t('curriculumVitae')}
        </label>

        <button
          type='button'
          onClick={() => setUsarCvGuardado((current) => !current)}
          className={`flex w-full min-w-0 items-center justify-center gap-2 rounded-lg border-2 border-dashed px-4 py-3 text-sm font-medium transition-colors ${
            usarCvGuardado
              ? 'border-[var(--color-primary)] bg-[var(--color-primary-pale)] text-[var(--color-primary)]'
              : 'border-[var(--color-border)] bg-[var(--color-card)] text-[var(--color-text-muted)] hover:border-[var(--color-primary-light)]'
          }`}
        >
          <Cloud className='size-4 shrink-0' />
          <span className='break-words'>{t('usarCvGuardado')}</span>
        </button>
      </div>

      <AppButton
        type='submit'
        variant='primary'
        className='inline-flex w-full items-center justify-center gap-2 !whitespace-nowrap'
      >
        <Send className='size-4 shrink-0' />
        {t('enviarPostulacion')}
      </AppButton>
    </form>
  );
}
