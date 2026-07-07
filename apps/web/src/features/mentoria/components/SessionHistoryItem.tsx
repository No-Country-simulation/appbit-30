'use client';

import { useTranslations } from 'next-intl';
import { FileText, User } from 'lucide-react';
import { AppButton } from '@/src/components/app/AppButton';

interface Props {
  nombre: string;
  tipoSesion: string;
  fecha: string;
  onVerNotas: () => void;
}

const tipoLabels: Record<string, string> = {
  revisionCV: 'revisionCV',
  orientacionCarrera: 'orientacionCarrera',
  preparacionEntrevistas: 'preparacionEntrevistas',
};

export function SessionHistoryItem({ nombre, tipoSesion, fecha, onVerNotas }: Props) {
  const t = useTranslations('Mentoria');
  const tipoLabel = tipoLabels[tipoSesion] ?? tipoSesion;

  return (
    <div className='flex items-center justify-between rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] p-4'>
      <div className='flex items-center gap-3'>
        <div className='flex size-10 items-center justify-center rounded-full bg-violet-100 text-violet-700'>
          <User className='size-5' />
        </div>
        <div>
          <h4 className='font-medium text-[var(--color-text)]'>{nombre}</h4>
          <p className='text-sm text-[var(--color-text-muted)]'>
            {t(tipoLabel)} • {fecha}
          </p>
        </div>
      </div>

      <AppButton
        variant='outline'
        className='inline-flex items-center gap-1.5 text-xs'
        onClick={onVerNotas}
      >
        <FileText className='size-3.5' />
        {t('verNotasCompartidas')}
      </AppButton>
    </div>
  );
}
