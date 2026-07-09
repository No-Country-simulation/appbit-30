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

export function SessionHistoryItem({
  nombre,
  tipoSesion,
  fecha,
  onVerNotas,
}: Props) {
  const t = useTranslations('Mentoria');
  const tipoLabel = tipoLabels[tipoSesion] ?? tipoSesion;

  return (
    <article className='flex min-w-0 flex-col gap-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] p-4 sm:flex-row sm:items-center sm:justify-between'>
      <div className='flex min-w-0 items-center gap-3'>
        <div className='flex size-10 shrink-0 items-center justify-center rounded-full bg-violet-100 text-violet-700'>
          <User className='size-5' />
        </div>

        <div className='min-w-0'>
          <h4 className='break-words font-medium text-[var(--color-text)]'>
            {nombre}
          </h4>

          <p className='break-words text-sm text-[var(--color-text-muted)]'>
            {t(tipoLabel)} • {fecha}
          </p>
        </div>
      </div>

      <AppButton
        variant='outline'
        className='inline-flex w-full items-center gap-1.5 text-xs sm:w-auto'
        onClick={onVerNotas}
      >
        <FileText className='size-3.5 shrink-0' />
        {t('verNotasCompartidas')}
      </AppButton>
    </article>
  );
}
