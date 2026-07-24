'use client';

import { useTranslations } from 'next-intl';
import { Download, Train } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/src/components/ui/dialog';
import { AppButton } from '@/src/components/app/AppButton';

interface DownloadItem {
  titulo: string;
  tamanioMb: number;
  tipo: 'video' | 'pdf';
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  items: DownloadItem[];
  onDownload: () => void;
}

export function OfflineDownloadModal({ open, onOpenChange, items, onDownload }: Props) {
  const t = useTranslations('Formacion');
  const totalMb = items.reduce((sum, item) => sum + item.tamanioMb, 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='safe-modal-content w-[min(calc(100vw-1rem),30rem)] p-0'>
        <div className='flex min-w-0 flex-col'>
          <div className='flex flex-col items-center px-5 pb-5 pt-6 text-center sm:px-7 sm:pb-6'>
            <div className='mb-4 flex size-14 shrink-0 items-center justify-center rounded-full bg-amber-100'>
              <Train className='size-7 text-amber-500' />
            </div>

            <DialogTitle>{t('saliendoDeCasa')}</DialogTitle>

            <DialogDescription className='mt-3 max-w-[25rem] text-[var(--color-text-muted)]'>
              {t('descargarModuloDetalle')}
            </DialogDescription>
          </div>

          <div className='px-5 pb-5 sm:px-7 sm:pb-6'>
            <div className='space-y-3 rounded-xl bg-gray-50 px-4 py-4'>
              {items.map((item) => (
                <div
                  key={item.titulo}
                  className='flex min-w-0 items-start justify-between gap-4'
                >
                  <span className='min-w-0 break-words text-left text-sm font-medium leading-relaxed text-[var(--color-text)]'>
                    {item.titulo}
                  </span>
                  <span className='shrink-0 pt-0.5 text-sm text-[var(--color-text-muted)]'>
                    {item.tamanioMb} {t('mb')}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className='border-t border-[var(--color-border)] px-5 py-4 sm:px-7 sm:py-5'>
            <AppButton
              variant='primary'
              className='inline-flex w-full items-center justify-center gap-2'
              onClick={onDownload}
            >
              <Download className='size-4' />
              {t('descargar')} ({totalMb} {t('mb')})
            </AppButton>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
