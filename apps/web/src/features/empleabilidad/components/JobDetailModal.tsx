'use client';

import { useTranslations } from 'next-intl';
import { Calendar, MapPin, Clock } from 'lucide-react';
import { Dialog, DialogContent } from '@/src/components/ui/dialog';
import { SkillCompatibilityList } from './SkillCompatibilityList';
import { PostulationForm } from './PostulationForm';

interface VacanteData {
  id: string;
  titulo: string;
  empresa: string;
  empresaDescripcion?: string;
  logoUrl?: string;
  area: string;
  nivel: string;
  modalidad: string;
  modalidadDetallada?: string;
  ubicacion: string;
  distancia?: string;
  matchPorcentaje: number;
  descripcion: string;
  fechaPublicacion?: string;
  educacionRequerida: string[];
  experienciaSolicitada: string[];
  idioma: string[];
  jornada: string[];
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
      <DialogContent className='max-h-[90vh] overflow-x-hidden overflow-y-auto sm:max-w-2xl'>
        {/* Header */}
        <div className='rounded-t-xl bg-gradient-to-r from-[#1a1a3e] to-[#2d1b69] p-6 text-white -mx-4 -mt-4 sm:-mx-6 sm:-mt-6 sm:px-8 sm:pt-8'>
          <div className='flex items-start justify-between'>
            <div className='flex items-start gap-4'>
              <div className='flex size-16 shrink-0 items-center justify-center rounded-xl bg-white/20 text-2xl font-bold backdrop-blur-sm sm:size-20 sm:text-3xl'>
                {vacante.logoUrl ? (
                  <img
                    src={vacante.logoUrl}
                    alt={vacante.empresa}
                    className='size-16 rounded-xl object-cover sm:size-20'
                  />
                ) : (
                  vacante.empresa.charAt(0).toUpperCase()
                )}
              </div>
              <div>
                <p className='text-xs font-medium uppercase tracking-wider text-white/70'>
                  {t('quienOfrece')}
                </p>
                <h2 className='text-xl font-bold sm:text-2xl'>{vacante.empresa}</h2>
                {vacante.empresaDescripcion && (
                  <p className='mt-1 text-sm text-white/80'>{vacante.empresaDescripcion}</p>
                )}
              </div>
            </div>
            {vacante.fechaPublicacion && (
              <div className='flex items-center gap-1.5 text-xs text-white/60'>
                <Calendar className='size-3.5' />
                <span>{t('publicado', { fecha: vacante.fechaPublicacion })}</span>
              </div>
            )}
          </div>
        </div>

        <div className='space-y-6 px-2'>
          {/* Título + tags */}
          <div>
            <h3 className='text-2xl font-bold text-[var(--color-text)]'>{vacante.titulo}</h3>
            <div className='mt-3 flex flex-wrap gap-2'>
              <span className='inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700'>
                📊 {vacante.area}
              </span>
              <span className='inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700'>
                🎓 {vacante.nivel}
              </span>
              <span className='inline-flex items-center gap-1.5 rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700'>
                % {vacante.matchPorcentaje} Match
              </span>
            </div>
          </div>

          {/* Descripción */}
          <div>
            <h4 className='mb-2 text-sm font-bold uppercase tracking-wide text-[var(--color-text)]'>
              {t('descripcionBusqueda')}
            </h4>
            <p className='text-sm leading-relaxed text-[var(--color-text-muted)]'>
              {vacante.descripcion}
            </p>
          </div>

          {/* Grid 2x2 */}
          <div className='grid grid-cols-2 gap-4'>
            <div className='rounded-xl border border-[var(--color-border)] p-4'>
              <p className='mb-2 text-xs font-bold uppercase tracking-wide text-[var(--color-text-muted)]'>
                🎓 {t('educacionRequerida')}
              </p>
              <div className='flex flex-wrap gap-1.5'>
                {vacante.educacionRequerida.map((item) => (
                  <span
                    key={item}
                    className='rounded-full bg-green-50 px-2.5 py-1 text-xs font-medium text-green-700'
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
            <div className='rounded-xl border border-[var(--color-border)] p-4'>
              <p className='mb-2 text-xs font-bold uppercase tracking-wide text-[var(--color-text-muted)]'>
                💼 {t('experienciaSolicitada')}
              </p>
              <div className='flex flex-wrap gap-1.5'>
                {vacante.experienciaSolicitada.map((item) => (
                  <span
                    key={item}
                    className='rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700'
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
            <div className='rounded-xl border border-[var(--color-border)] p-4'>
              <p className='mb-2 text-xs font-bold uppercase tracking-wide text-[var(--color-text-muted)]'>
                🌐 {t('idioma')}
              </p>
              <div className='flex flex-wrap gap-1.5'>
                {vacante.idioma.map((item) => (
                  <span
                    key={item}
                    className='rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700'
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
            <div className='rounded-xl border border-[var(--color-border)] p-4'>
              <p className='mb-2 text-xs font-bold uppercase tracking-wide text-[var(--color-text-muted)]'>
                🕐 {t('jornada')}
              </p>
              <div className='flex flex-wrap gap-1.5'>
                {vacante.jornada.map((item) => (
                  <span
                    key={item}
                    className='rounded-full bg-green-50 px-2.5 py-1 text-xs font-medium text-green-700'
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Ubicación / Modalidad */}
          <div className='rounded-xl border border-[var(--color-border)] p-4'>
            <p className='mb-3 text-sm font-bold uppercase tracking-wide text-[var(--color-text)]'>
              📍 {t('ubicacionModalidad')}
            </p>
            <div className='flex flex-wrap items-center gap-4 text-sm text-[var(--color-text-muted)]'>
              {vacante.modalidadDetallada && (
                <span className='flex items-center gap-1.5'>
                  <MapPin className='size-4 text-red-500' />
                  {vacante.modalidadDetallada}
                </span>
              )}
              <span className='flex items-center gap-1.5'>
                <MapPin className='size-4 text-red-500' />
                {vacante.ubicacion}
              </span>
              {vacante.distancia && (
                <span className='flex items-center gap-1.5'>
                  <Clock className='size-4 text-[var(--color-text-muted)]' />
                  {vacante.distancia}
                </span>
              )}
            </div>
          </div>

          {/* Análisis de compatibilidad */}
          <div>
            <h4 className='mb-3 text-sm font-bold uppercase tracking-wide text-[var(--color-text)]'>
              {t('analisisCompatibilidad')}
            </h4>
            <SkillCompatibilityList skills={vacante.skills} />
          </div>

          {/* Postúlate ahora */}
          <div>
            <h4 className='mb-3 text-sm font-bold uppercase tracking-wide text-[var(--color-text)]'>
              {t('postulateAhora')}
            </h4>
            <PostulationForm onSubmit={onPostular} />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
