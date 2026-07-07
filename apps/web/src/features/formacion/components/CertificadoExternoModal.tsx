'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Sun } from 'lucide-react';
import { Dialog, DialogContent } from '@/src/components/ui/dialog';
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
  const [archivo, setArchivo] = useState<File | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSubmit({ enlace, archivo: archivo ?? undefined });
    setEnlace('');
    setArchivo(null);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-md'>
        <div className='flex flex-col items-center text-center'>
          <div className='mb-4 flex size-14 items-center justify-center rounded-full bg-amber-100'>
            <Sun className='size-7 text-amber-500' />
          </div>

          <h2 className='text-lg font-bold text-[var(--color-text)]'>
            {t('validarCertExterno')}
          </h2>
          <p className='mt-2 text-sm text-[var(--color-text-muted)]'>
            {t('validarCertExternoDesc')}
          </p>
        </div>

        <form onSubmit={handleSubmit} className='space-y-5'>
          <div className='space-y-2'>
            <label className='text-sm font-medium text-[var(--color-text)]'>
              {t('enlaceCertificado')}
            </label>
            <AppInput
              value={enlace}
              onChange={(e) => setEnlace(e.target.value)}
              placeholder='https://udemy.com/certificate/...'
            />
          </div>

          <div className='space-y-2'>
            <label className='text-sm font-medium text-[var(--color-text)]'>
              {t('cargarDocumento')}
            </label>
            <label className='flex cursor-pointer items-center gap-2 rounded-lg border-2 border-dashed border-[var(--color-border)] p-4 text-sm text-[var(--color-text-muted)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]'>
              <input
                type='file'
                accept='.pdf,.jpg,.jpeg,.png'
                className='hidden'
                onChange={(e) => setArchivo(e.target.files?.[0] ?? null)}
              />
              {archivo ? archivo.name : t('seleccionarArchivo')}
            </label>
          </div>

          <AppButton
            type='submit'
            variant='primary'
            className='w-full'
            disabled={!enlace.trim() && !archivo}
          >
            {t('enviarAValidacion')}
          </AppButton>
        </form>
      </DialogContent>
    </Dialog>
  );
}
