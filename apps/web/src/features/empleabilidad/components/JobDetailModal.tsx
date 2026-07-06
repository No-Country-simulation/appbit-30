'use client';

import { useTranslations } from 'next-intl';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/src/components/ui/dialog';
import { AppBadge } from '@/src/components/app/AppBadge';
import { AppButton } from '@/src/components/app/AppButton';
import { SkillCompatibilityList } from './SkillCompatibilityList';
import { PostulationForm } from './PostulationForm';

interface VacanteData {
  id: string;
  titulo: string;
  empresa: string;
  logoUrl?: string;
  area: string;
  nivel: string;
  modalidad: string;
  ubicacion: string;
  matchPorcentaje: number;
  descripcion: string;
  educacionRequerida: string;
  experienciaSolicitada: string;
  idioma: string;
  jornada: string;
  skills: { nombre: string; laTienes: boolean }[];
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vacante: VacanteData;
  onPostular: (data: { mensaje: string; usarCvGuardado: boolean }) => void;
}

export function JobDetailModal({ open, onOpenChange, vacante, onPostular }: Props) {
  const t = useTranslations('Empleabilidad');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-2xl'>
        <DialogHeader>
          <div className='flex items-center gap-3'>
            <div className='flex size-12 items-center justify-center rounded-full bg-[var(--color-primary-pale)] text-lg font-bold text-[var(--color-primary)]'>
              {vacante.logoUrl ? (
                <img src={vacante.logoUrl} alt={vacante.empresa} className='size-12 rounded-full object-cover' />
              ) : (
                vacante.empresa.charAt(0).toUpperCase()
              )}
            </div>
            <div>
              <p className='text-xs text-[var(--color-text-muted)]'>{t('quienOfrece')}</p>
              <DialogTitle className='text-base'>{vacante.empresa}</DialogTitle>
            </div>
          </div>
        </DialogHeader>

        <div className='space-y-6'>
          <div>
            <h3 className='text-lg font-semibold text-[var(--color-text)]'>{vacante.titulo}</h3>
            <div className='mt-2 flex flex-wrap gap-2'>
              <AppBadge variant='primary'>{vacante.area}</AppBadge>
              <AppBadge variant='primary'>{vacante.nivel}</AppBadge>
              <AppBadge variant='success'>{vacante.matchPorcentaje}% match</AppBadge>
            </div>
          </div>

          <div>
            <h4 className='mb-2 text-sm font-semibold text-[var(--color-text)]'>
              {t('descripcionBusqueda')}
            </h4>
            <p className='text-sm text-[var(--color-text-muted)]'>{vacante.descripcion}</p>
          </div>

          <div className='grid grid-cols-2 gap-4'>
            <div className='rounded-lg border border-[var(--color-border)] p-3'>
              <p className='text-xs text-[var(--color-text-muted)]'>{t('educacionRequerida')}</p>
              <p className='text-sm font-medium text-[var(--color-text)]'>{vacante.educacionRequerida}</p>
            </div>
            <div className='rounded-lg border border-[var(--color-border)] p-3'>
              <p className='text-xs text-[var(--color-text-muted)]'>{t('experienciaSolicitada')}</p>
              <p className='text-sm font-medium text-[var(--color-text)]'>{vacante.experienciaSolicitada}</p>
            </div>
            <div className='rounded-lg border border-[var(--color-border)] p-3'>
              <p className='text-xs text-[var(--color-text-muted)]'>Idioma</p>
              <p className='text-sm font-medium text-[var(--color-text)]'>{vacante.idioma}</p>
            </div>
            <div className='rounded-lg border border-[var(--color-border)] p-3'>
              <p className='text-xs text-[var(--color-text-muted)]'>Jornada</p>
              <p className='text-sm font-medium text-[var(--color-text)]'>{vacante.jornada}</p>
            </div>
          </div>

          <div>
            <h4 className='mb-2 text-sm font-semibold text-[var(--color-text)]'>
              {t('ubicacionModalidad')}
            </h4>
            <p className='text-sm text-[var(--color-text-muted)]'>
              {vacante.ubicacion} · {vacante.modalidad}
            </p>
          </div>

          <div>
            <h4 className='mb-2 text-sm font-semibold text-[var(--color-text)]'>
              {t('analisisCompatibilidad')}
            </h4>
            <SkillCompatibilityList skills={vacante.skills} />
          </div>

          <div>
            <h4 className='mb-2 text-sm font-semibold text-[var(--color-text)]'>
              {t('postulateAhora')}
            </h4>
            <PostulationForm onSubmit={onPostular} />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
