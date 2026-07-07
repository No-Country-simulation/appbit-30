'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from 'lucide-react';
import { AppInput } from '@/src/components/app/AppInput';
import { AppButton } from '@/src/components/app/AppButton';

interface Props {
  onValidar: (url: string) => void;
}

export function ExternalCourseValidation({ onValidar }: Props) {
  const t = useTranslations('Formacion');
  const [url, setUrl] = useState('');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (url.trim()) {
      onValidar(url.trim());
    }
  }

  return (
    <section className='rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] p-5'>
      <div className='flex items-start gap-3'>
        <div className='flex size-10 shrink-0 items-center justify-center rounded-full bg-violet-100'>
          <Link className='size-5 text-violet-600' />
        </div>
        <div className='space-y-1'>
          <h3 className='text-sm font-bold text-[var(--color-text)]'>
            {t('validarHabilidadTitulo')}
          </h3>
          <p className='text-xs text-[var(--color-text-muted)]'>
            {t('validarHabilidadDesc')}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className='mt-4 flex items-end gap-3'>
        <div className='flex-1'>
          <AppInput
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder={t('enlaceCertificado')}
          />
        </div>

        <AppButton
          type='submit'
          variant='primary'
          className='inline-flex items-center gap-2'
          disabled={!url.trim()}
        >
          {t('validarYActualizar')}
        </AppButton>
      </form>
    </section>
  );
}
