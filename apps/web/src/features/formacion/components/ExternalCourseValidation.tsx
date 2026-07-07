'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { ExternalLink } from 'lucide-react';
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
      <h3 className='text-sm font-bold text-[var(--color-text)]'>
        {t('completasteCursoFuera')}
      </h3>

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
          <ExternalLink className='size-4' />
          {t('validarYActualizar')}
        </AppButton>
      </form>
    </section>
  );
}
