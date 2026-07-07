'use client';

import { useTranslations } from 'next-intl';
import { Download, Train } from 'lucide-react';
import { Dialog, DialogContent } from '@/src/components/ui/dialog';
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
      <DialogContent className='sm:max-w-md'>
        <div className='flex flex-col items-center text-center'>
          <div className='mb-4 flex size-14 items-center justify-center rounded-full bg-amber-100'>
            <Train className='size-7 text-amber-500' />
          </div>

          <h2 className='text-lg font-bold text-[var(--color-text)]'>
            {t('saliendoDeCasa')}
          </h2>
          <p className='mt-2 text-sm text-[var(--color-text-muted)]'>
            {t('descargarModuloDetalle')}
          </p>
        </div>

        <div className='rounded-xl bg-gray-50 p-4 space-y-2'>
          {items.map((item) => (
            <div
              key={item.titulo}
              className='flex items-center justify-between'
            >
              <span className='text-sm font-medium text-[var(--color-text)]'>
                {item.titulo}
              </span>
              <span className='text-sm text-[var(--color-text-muted)]'>
                {item.tamanioMb} {t('mb')}
              </span>
            </div>
          ))}
        </div>

        <AppButton
          variant='primary'
          className='inline-flex w-full items-center justify-center gap-2'
          onClick={onDownload}
        >
          <Download className='size-4' />
          {t('descargar')} ({totalMb} {t('mb')})
        </AppButton>
      </DialogContent>
    </Dialog>
  );
}
