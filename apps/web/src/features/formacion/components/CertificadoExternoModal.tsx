'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Sun } from 'lucide-react';
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
  onSubmit: (data: { enlace: string; archivo?: File }) => void;
}

export function CertificadoExternoModal({
  open,
  onOpenChange,
  onSubmit,
}: Props) {
  const t = useTranslations('Formacion');
  const [enlace, setEnlace] = useState('');
  const [archivo, setArchivo] = useState<File | null>(null);

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    onSubmit({
      enlace: enlace.trim(),
      archivo: archivo ?? undefined,
    });

    setEnlace('');
    setArchivo(null);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='safe-modal-content w-[min(calc(100vw-1rem),30rem)] p-0'>
        <form onSubmit={handleSubmit} className='flex min-w-0 flex-col'>
          <div className='min-w-0 border-b border-[var(--color-border)] px-4 pb-4 pt-5 text-center sm:px-6'>
            <div className='mx-auto mb-3 flex size-14 items-center justify-center rounded-full bg-amber-100'>
              <Sun className='size-7 text-amber-500' />
            </div>

            <h2 className='break-words text-base font-bold leading-tight text-[var(--color-text)] sm:text-lg'>
              {t('validarCertExterno')}
            </h2>

            <p className='mx-auto mt-2 max-w-[24rem] break-words text-sm leading-relaxed text-[var(--color-text-muted)]'>
              {t('validarCertExternoDesc')}
            </p>
          </div>

          <div className='min-w-0 space-y-4 px-4 py-4 sm:px-6'>
            <div className='min-w-0 space-y-1.5'>
              <label className='block text-sm font-medium text-[var(--color-text)]'>
                {t('enlaceCertificado')}
              </label>

              <AppInput
                value={enlace}
                onChange={(event) => setEnlace(event.target.value)}
                placeholder='https://udemy.com/certificate/...'
                className='w-full'
              />
            </div>

            <div className='min-w-0 space-y-1.5'>
              <label className='block text-sm font-medium text-[var(--color-text)]'>
                {t('cargarDocumento')}
              </label>

              <label className='flex min-h-14 w-full min-w-0 cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-[var(--color-border)] px-3 py-3 text-center text-sm leading-snug text-[var(--color-text-muted)] transition-colors hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]'>
                <input
                  type='file'
                  accept='.pdf,.jpg,.jpeg,.png'
                  className='sr-only'
                  onChange={(event) =>
                    setArchivo(event.target.files?.[0] ?? null)
                  }
                />

                <span className='min-w-0 max-w-full truncate'>
                  {archivo ? archivo.name : t('seleccionarArchivo')}
                </span>
              </label>
            </div>
          </div>

          <DialogFooter className='border-t border-[var(--color-border)] px-4 py-4 sm:px-6'>
            <AppButton
              type='submit'
              variant='primary'
              className='w-full'
              disabled={!enlace.trim() && !archivo}
            >
              {t('enviarAValidacion')}
            </AppButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
