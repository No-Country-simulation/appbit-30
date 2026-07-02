'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Send, FileText } from 'lucide-react';
import { AppButton } from '@/src/components/app/AppButton';

interface Props {
  vacanteId: string;
  onSubmit: (data: { mensaje_motivacion?: string; usar_cv_guardado: boolean; cv_url?: string }) => void;
  onCancel?: () => void;
  isSubmitting?: boolean;
}

export function PostulationForm({ vacanteId, onSubmit, onCancel, isSubmitting }: Props) {
  const t = useTranslations('Empleabilidad');
  const [mensaje, setMensaje] = useState('');
  const [usarCv, setUsarCv] = useState(true);
  const [cvUrl, setCvUrl] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      mensaje_motivacion: mensaje.trim() || undefined,
      usar_cv_guardado: usarCv,
      cv_url: !usarCv && cvUrl ? cvUrl : undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} className='space-y-4'>
      <div>
        <label className='mb-1 block text-sm font-medium text-[var(--color-text)]'>
          {t('mensajeLabel')}
        </label>
        <textarea
          value={mensaje}
          onChange={(e) => setMensaje(e.target.value)}
          placeholder={t('mensajePlaceholder')}
          rows={3}
          maxLength={2000}
          className='w-full resize-none rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-card)] p-3 text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-primary)] focus:outline-none'
        />
        <p className='mt-1 text-xs text-[var(--color-text-muted)]'>{mensaje.length}/2000</p>
      </div>

      <div className='space-y-2'>
        <label className='flex items-center gap-2'>
          <input
            type='radio'
            name='cv_option'
            checked={usarCv}
            onChange={() => setUsarCv(true)}
            className='accent-[var(--color-primary)]'
          />
          <span className='flex items-center gap-1.5 text-sm text-[var(--color-text)]'>
            <FileText className='size-4' />
            {t('cvGuardado')}
          </span>
        </label>
        <label className='flex items-center gap-2'>
          <input
            type='radio'
            name='cv_option'
            checked={!usarCv}
            onChange={() => setUsarCv(false)}
            className='accent-[var(--color-primary)]'
          />
          <span className='text-sm text-[var(--color-text)]'>{t('cvUrl')}</span>
        </label>
        {!usarCv && (
          <input
            type='url'
            value={cvUrl}
            onChange={(e) => setCvUrl(e.target.value)}
            placeholder='https://...'
            className='ml-6 w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-card)] p-2 text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-primary)] focus:outline-none'
          />
        )}
      </div>

      <div className='flex gap-2'>
        {onCancel && (
          <AppButton type='button' variant='outline' className='flex-1' onClick={onCancel}>
            {t('cancelar')}
          </AppButton>
        )}
        <AppButton type='submit' className='flex-1' disabled={isSubmitting}>
          {isSubmitting ? t('enviando') : t('enviar')}
          <Send className='ml-1.5 size-4' />
        </AppButton>
      </div>
    </form>
  );
}
