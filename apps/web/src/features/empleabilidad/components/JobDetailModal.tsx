'use client';

/* eslint-disable @next/next/no-img-element */

import { useFormatter, useTranslations } from 'next-intl';
import { Calendar, Clock, MapPin } from 'lucide-react';
import { Dialog, DialogContent } from '@/src/components/ui/dialog';
import { SkillCompatibilityList } from './SkillCompatibilityList';
import { PostulationForm } from './PostulationForm';
import type { VacanteItem } from '../types';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vacante: VacanteItem;
  onPostular: (data: {
    mensaje_motivacion: string;
    usar_cv_guardado: boolean;
  }) => void | Promise<void>;
  isSubmitting?: boolean;
  submitError?: string | null;
}

export function JobDetailModal({
  open,
  onOpenChange,
  vacante,
  onPostular,
  isSubmitting,
  submitError,
}: Props) {
  const t = useTranslations('Empleabilidad');
  const format = useFormatter();
  const publicationDate = format.dateTime(new Date(vacante.fechaPublicacion), {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='safe-modal-content w-[min(calc(100vw-1rem),44rem)] p-0'>
        <div className='flex max-h-[90dvh] min-w-0 flex-col overflow-hidden'>
          <div className='min-w-0 bg-gradient-to-r from-[#1a1a3e] to-[#2d1b69] px-4 py-5 text-white sm:px-6'>
            <div className='flex min-w-0 flex-col gap-4 sm:flex-row sm:items-start sm:justify-between'>
              <div className='flex min-w-0 items-start gap-4'>
                <div className='flex size-14 shrink-0 items-center justify-center rounded-xl bg-white/20 text-xl font-bold backdrop-blur-sm sm:size-16'>
                  {vacante.logoUrl ? (
                    <img
                      src={vacante.logoUrl}
                      alt={vacante.empresa}
                      className='size-14 rounded-xl object-cover sm:size-16'
                    />
                  ) : (
                    vacante.empresa.charAt(0).toUpperCase()
                  )}
                </div>

                <div className='min-w-0'>
                  <p className='break-words text-xs font-medium uppercase tracking-wider text-white/70'>
                    {t('quienOfrece')}
                  </p>

                  <h2 className='break-words text-xl font-bold leading-tight sm:text-2xl'>
                    {vacante.empresa}
                  </h2>

                  {vacante.empresaDescripcion && (
                    <p className='mt-1 break-words text-sm leading-relaxed text-white/80'>
                      {vacante.empresaDescripcion}
                    </p>
                  )}
                </div>
              </div>

              {vacante.fechaPublicacion && (
                <div className='flex shrink-0 items-center gap-1.5 text-xs text-white/70'>
                  <Calendar className='size-3.5 shrink-0' />
                  <span className='break-words'>
                    {t('publicado', { fecha: publicationDate })}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className='min-h-0 flex-1 overflow-y-auto px-4 py-5 sm:px-6'>
            <div className='min-w-0 space-y-6'>
              <div className='min-w-0'>
                <h3 className='break-words text-2xl font-bold leading-tight text-[var(--color-text)]'>
                  {vacante.titulo}
                </h3>

                <div className='mt-4 flex min-w-0 flex-wrap gap-2.5'>
                  <TopTag>{vacante.area}</TopTag>
                  <TopTag>{vacante.nivel}</TopTag>

                  <span className='inline-flex max-w-full items-center rounded-full bg-green-50 px-3 py-1.5 text-xs font-semibold leading-snug text-green-700'>
                    <span className='min-w-0 break-words'>
                      {vacante.matchPorcentaje === null
                        ? t('matchNoDisponible')
                        : `${vacante.matchPorcentaje}% ${t('match')}`}
                    </span>
                  </span>
                </div>
              </div>

              <section className='min-w-0 border-t border-[var(--color-border)] pt-5'>
                <h4 className='mb-3 break-words text-sm font-bold uppercase tracking-wide text-[var(--color-text)]'>
                  {t('descripcionBusqueda')}
                </h4>

                <p className='break-words text-sm leading-relaxed text-[var(--color-text-muted)]'>
                  {vacante.descripcion}
                </p>
              </section>

              <section className='grid min-w-0 grid-cols-1 gap-4 border-t border-[var(--color-border)] pt-5 sm:grid-cols-2'>
                <InfoBox
                  title={`🎓 ${t('educacionRequerida')}`}
                  items={vacante.educacionRequerida}
                />

                <InfoBox
                  title={`💼 ${t('experienciaSolicitada')}`}
                  items={vacante.experienciaSolicitada}
                />

                <InfoBox title={`🌐 ${t('idioma')}`} items={vacante.idioma} />

                <InfoBox title={`🕐 ${t('jornada')}`} items={vacante.jornada} />
              </section>

              <section className='min-w-0 rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] p-4'>
                <p className='mb-4 break-words text-sm font-bold uppercase tracking-wide text-[var(--color-text)]'>
                  📍 {t('ubicacionModalidad')}
                </p>

                <div className='flex min-w-0 flex-col gap-3 text-sm text-[var(--color-text-muted)] sm:flex-row sm:flex-wrap'>
                  {vacante.modalidadDetallada && (
                    <span className='flex min-w-0 items-start gap-1.5'>
                      <MapPin className='mt-0.5 size-4 shrink-0 text-red-500' />
                      <span className='min-w-0 break-words'>
                        {vacante.modalidadDetallada}
                      </span>
                    </span>
                  )}

                  <span className='flex min-w-0 items-start gap-1.5'>
                    <MapPin className='mt-0.5 size-4 shrink-0 text-red-500' />
                    <span className='min-w-0 break-words'>
                      {vacante.ubicacion}
                    </span>
                  </span>

                  {vacante.distancia && (
                    <span className='flex min-w-0 items-start gap-1.5'>
                      <Clock className='mt-0.5 size-4 shrink-0 text-[var(--color-text-muted)]' />
                      <span className='min-w-0 break-words'>
                        {vacante.distancia}
                      </span>
                    </span>
                  )}
                </div>
              </section>

              <section className='min-w-0 border-t border-[var(--color-border)] pt-5'>
                <h4 className='mb-4 break-words text-sm font-bold uppercase tracking-wide text-[var(--color-text)]'>
                  {t('analisisCompatibilidad')}
                </h4>

                <SkillCompatibilityList skills={vacante.skills} />
              </section>

              <section className='min-w-0 border-t border-[var(--color-border)] pt-5'>
                <h4 className='mb-4 break-words text-sm font-bold uppercase tracking-wide text-[var(--color-text)]'>
                  {t('postulateAhora')}
                </h4>

                <PostulationForm
                  onSubmit={onPostular}
                  isSubmitting={isSubmitting}
                  submitError={submitError}
                />
              </section>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function TopTag({ children }: { children: React.ReactNode }) {
  return (
    <span className='inline-flex max-w-full items-center rounded-full bg-blue-50 px-3 py-1.5 text-xs font-semibold leading-snug text-blue-700'>
      <span className='min-w-0 break-words'>{children}</span>
    </span>
  );
}

function InfoBox({ title, items }: { title: string; items: string[] }) {
  return (
    <div className='min-w-0 rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] p-4'>
      <p className='mb-4 break-words text-xs font-bold uppercase tracking-wide text-[var(--color-text-muted)]'>
        {title}
      </p>

      <div className='flex min-w-0 flex-wrap gap-2.5'>
        {items.map((item) => (
          <InfoTag key={item}>{item}</InfoTag>
        ))}
      </div>
    </div>
  );
}

function InfoTag({ children }: { children: React.ReactNode }) {
  return (
    <span className='inline-flex w-fit max-w-full items-center rounded-lg bg-[var(--color-primary-pale)] px-3 py-2 text-left text-xs font-medium leading-snug text-[var(--color-primary)]'>
      <span className='min-w-0 break-words'>{children}</span>
    </span>
  );
}
