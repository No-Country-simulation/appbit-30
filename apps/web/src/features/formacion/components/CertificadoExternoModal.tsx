'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Medal, Upload } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/src/components/ui/dialog';
import { AppInput } from '@/src/components/app/AppInput';
import { AppButton } from '@/src/components/app/AppButton';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: { enlace: string; archivo?: File }) => void;
}

export function CertificadoExternoModal({ open, onOpenChange, onSubmit }: Props) {
  const t = useTranslations('Formacion');
  const [enlace, setEnlace] = useState('');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSubmit({ enlace });
    setEnlace('');
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            <Medal className='size-5 text-[var(--color-primary)]' />
            {t('validarCertExterno')}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className='space-y-5'>
          <div className='space-y-2'>
            <label className='text-sm font-medium text-[var(--color-text)]'>
              {t('enlaceCertificado')}
            </label>
            <AppInput
              value={enlace}
              onChange={(e) => setEnlace(e.target.value)}
              placeholder='https://coursera.org/certificate/...'
            />
          </div>

          <div className='space-y-2'>
            <label className='text-sm font-medium text-[var(--color-text)]'>
              {t('enlaceCertificado')}
            </label>
            <label className='flex cursor-pointer items-center justify-center gap-2 rounded-lg border-2 border-dashed border-[var(--color-border)] p-4 text-sm text-[var(--color-text-muted)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]'>
              <Upload className='size-4' />
              PDF, JPG
              <input type='file' accept='.pdf,.jpg,.jpeg,.png' className='hidden' />
            </label>
          </div>

          <AppButton
            type='submit'
            variant='primary'
            className='w-full'
            disabled={!enlace.trim()}
          >
            {t('enviarAValidacion')}
          </AppButton>
        </form>
      </DialogContent>
    </Dialog>
  );
}
