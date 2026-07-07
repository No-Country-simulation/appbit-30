'use client';

import { useTranslations } from 'next-intl';
import { Download, Wifi, FileVideo, FileText } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/src/components/ui/dialog';
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
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            <Wifi className='size-5 text-[var(--color-primary)]' />
            {t('saliendoDeCasa')}
          </DialogTitle>
        </DialogHeader>

        <p className='text-sm text-[var(--color-text-muted)]'>
          {t('descargarModulo')}
        </p>

        <div className='space-y-3'>
          {items.map((item) => (
            <div
              key={item.titulo}
              className='flex items-center justify-between rounded-lg border border-[var(--color-border)] p-3'
            >
              <div className='flex items-center gap-3'>
                {item.tipo === 'video' ? (
                  <FileVideo className='size-5 text-[var(--color-primary)]' />
                ) : (
                  <FileText className='size-5 text-[var(--color-text-muted)]' />
                )}
                <span className='text-sm font-medium text-[var(--color-text)]'>
                  {item.titulo}
                </span>
              </div>
              <span className='text-xs text-[var(--color-text-muted)]'>
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
