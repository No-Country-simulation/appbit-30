'use client';

import { useTranslations } from 'next-intl';
import { Building2, MapPin, Clock, GraduationCap, Briefcase, Globe } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/src/components/ui/dialog';
import { PostulationForm } from './PostulationForm';
import type { VacanteDetalle } from '../types';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vacante: VacanteDetalle | null;
  onSubmit: (data: { mensaje_motivacion?: string; usar_cv_guardado: boolean; cv_url?: string }) => void;
  isSubmitting?: boolean;
}

export function JobDetailModal({ open, onOpenChange, vacante, onSubmit, isSubmitting }: Props) {
  const t = useTranslations('Empleabilidad');

  if (!vacante) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-lg max-h-[90vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle>{vacante.titulo}</DialogTitle>
        </DialogHeader>

        <div className='space-y-5'>
          <div className='flex items-start gap-3'>
            <div className='flex size-10 shrink-0 items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-primary-pale)]'>
              <Building2 className='size-5 text-[var(--color-primary)]' />
            </div>
            <div>
              <p className='text-sm font-bold text-[var(--color-text)]'>{vacante.empresa.nombre}</p>
              <p className='text-xs text-[var(--color-text-muted)]'>{vacante.empresa.sector}</p>
            </div>
          </div>

          <div className='grid grid-cols-2 gap-3 text-sm'>
            <div className='flex items-center gap-2 text-[var(--color-text-muted)]'>
              <MapPin className='size-4 shrink-0' />
              <span>{vacante.ciudad ?? vacante.pais}, {vacante.pais}</span>
            </div>
            <div className='flex items-center gap-2 text-[var(--color-text-muted)]'>
              <Briefcase className='size-4 shrink-0' />
              <span>{t('nivel' + vacante.nivel)}</span>
            </div>
            <div className='flex items-center gap-2 text-[var(--color-text-muted)]'>
              <Globe className='size-4 shrink-0' />
              <span>{t('modalidad' + vacante.modalidad)}</span>
            </div>
            <div className='flex items-center gap-2 text-[var(--color-text-muted)]'>
              <Clock className='size-4 shrink-0' />
              <span>{vacante.jornada ? t('jornada' + vacante.jornada) : '-'}</span>
            </div>
          </div>

          {vacante.descripcion && (
            <div>
              <h4 className='mb-1 text-xs font-semibold uppercase text-[var(--color-text-muted)]'>{t('descripcion')}</h4>
              <p className='text-sm text-[var(--color-text)] leading-relaxed whitespace-pre-line'>{vacante.descripcion}</p>
            </div>
          )}

          {vacante.experiencia_solicitada && (
            <div className='flex items-center gap-2 text-sm'>
              <GraduationCap className='size-4 shrink-0 text-[var(--color-text-muted)]' />
              <span className='text-[var(--color-text)]'>{vacante.experiencia_solicitada}</span>
            </div>
          )}

          <div>
            <h4 className='mb-2 text-xs font-semibold uppercase text-[var(--color-text-muted)]'>{t('requisitos')}</h4>
            <div className='grid grid-cols-2 gap-2'>
              {vacante.requisitos.map((req) => (
                <div
                  key={req.requisito_id}
                  className='flex items-center gap-2 rounded-[var(--radius-sm)] bg-[var(--color-body)] px-3 py-2'
                >
                  <div className={'size-2 shrink-0 rounded-full ' + (req.prioridad > 1 ? 'bg-[var(--color-warning)]' : 'bg-[var(--color-primary)]')} />
                  <span className='text-xs font-medium text-[var(--color-text)]'>{req.habilidad.nombre}</span>
                </div>
              ))}
            </div>
          </div>

          <div className='border-t border-[var(--color-border)] pt-4'>
            <h4 className='mb-3 text-sm font-bold text-[var(--color-text)]'>{t('postularte')}</h4>
            <PostulationForm
              vacanteId={vacante.vacante_id}
              onSubmit={onSubmit}
              isSubmitting={isSubmitting}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
