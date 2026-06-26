import { RadarIcon } from 'lucide-react';
import { AppButton } from '@/src/components/app/AppButton';

export function RadarBanner() {
  return (
    <section className='flex items-center justify-between gap-4 rounded-[var(--radius-md)] border border-[var(--color-secondary-dark)]/30 bg-[var(--color-secondary-pale)] p-4 sm:px-6'>
      <div className='flex items-center gap-3'>
        <div className='flex size-10 shrink-0 items-center justify-center rounded-full bg-[var(--color-secondary-dark)]/20'>
          <RadarIcon className='size-5 text-[var(--color-warning)]' />
        </div>
        <div>
          <p className='text-sm font-semibold text-[var(--color-warning)]'>
            Radar CDRView
          </p>
          <p className='text-xs text-[var(--color-text-muted)]'>
            Vacantes cerca de tu zona con alta compatibilidad
          </p>
        </div>
      </div>

      <AppButton
        variant='outline'
        className='shrink-0 !border-[var(--color-secondary-dark)]/40 !px-4 !py-2 text-xs !text-[var(--color-warning)] hover:!bg-[var(--color-secondary-dark)]/10'
      >
        Ver vacantes recomendadas
      </AppButton>
    </section>
  );
}
