'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/src/i18n/navigation';
import { AppShell } from '@/src/components/layout/AppShell';
import { JobCard } from '../components/JobCard';
import { ApplicationCard } from '../components/ApplicationCard';
import { JobDetailModal } from '../components/JobDetailModal';
import type { EmployabilityData, PostulacionItem, VacanteItem } from '../types';

type Tab = 'recomendados' | 'aplicaciones';

interface Props {
  data: EmployabilityData;
}

export default function EmployabilityClient({ data }: Props) {
  const t = useTranslations('Empleabilidad');
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<Tab>('recomendados');
  const [selectedVacante, setSelectedVacante] = useState<VacanteItem | null>(
    null,
  );
  const [modalOpen, setModalOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [postulaciones, setPostulaciones] = useState<PostulacionItem[]>(
    data.postulaciones,
  );

  const appliedVacanteIds = new Set(
    postulaciones.map((item) => item.vacanteId),
  );

  function handleAplicar(vacante: VacanteItem) {
    const alreadyApplied = appliedVacanteIds.has(vacante.id);

    if (alreadyApplied) {
      setActiveTab('aplicaciones');
      return;
    }

    setSelectedVacante(vacante);
    setSubmitError(null);
    setModalOpen(true);
  }

  async function handlePostular(input: {
    mensaje_motivacion: string;
    usar_cv_guardado: boolean;
  }) {
    if (!selectedVacante || isSubmitting) return;

    const alreadyApplied = postulaciones.some(
      (item) => item.vacanteId === selectedVacante.id,
    );

    if (alreadyApplied) {
      setModalOpen(false);
      setActiveTab('aplicaciones');
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const response = await fetch('/api/postulaciones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vacante_id: selectedVacante.id, ...input }),
      });
      const payload = (await response.json().catch(() => null)) as {
        postulacionId?: string;
        error?: string;
      } | null;

      if (response.status === 409) {
        setModalOpen(false);
        setActiveTab('aplicaciones');
        router.refresh();
        return;
      }

      if (!response.ok || !payload?.postulacionId) {
        throw new Error(payload?.error || t('postulacionError'));
      }

      const newPostulacion: PostulacionItem = {
        id: payload.postulacionId,
        vacanteId: selectedVacante.id,
        titulo: selectedVacante.titulo,
        empresa: selectedVacante.empresa,
        logoUrl: selectedVacante.logoUrl,
        estado: 'Enviada',
        matchPorcentaje: selectedVacante.matchPorcentaje,
        feedback: null,
        skillRechazada: null,
        mensajesNuevos: 0,
        creadoEn: t('hoy'),
      };

      setPostulaciones((current) => [newPostulacion, ...current]);
      setModalOpen(false);
      setSuccessMessage(t('postulacionExitosa'));
      setActiveTab('aplicaciones');
      router.refresh();
      window.setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : t('postulacionError'),
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AppShell
      userName={data.user.name}
      avatarUrl={data.user.avatarUrl}
      profilePercent={data.user.profilePercent}
      perfilBreakdown={data.user.perfilBreakdown}
    >
      <div className='min-w-0 space-y-6'>
        <div className='min-w-0'>
          <h1 className='break-words text-2xl font-bold leading-tight text-[var(--color-text)] sm:text-3xl'>
            {t('title')}
          </h1>

          <p className='mt-1 max-w-3xl break-words text-sm leading-relaxed text-[var(--color-text-muted)]'>
            {t('subtitle')}
          </p>
        </div>

        {successMessage && (
          <div className='min-w-0 rounded-lg bg-[var(--color-success-bg)] px-4 py-3 text-sm font-medium text-[var(--color-success-text)]'>
            {successMessage}
          </div>
        )}

        <div className='grid min-w-0 grid-cols-2 gap-1 rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] p-1'>
          <TabButton
            active={activeTab === 'recomendados'}
            label={t('recomendados')}
            count={data.vacantes.length}
            onClick={() => setActiveTab('recomendados')}
          />

          <TabButton
            active={activeTab === 'aplicaciones'}
            label={t('misAplicaciones')}
            count={postulaciones.length}
            onClick={() => setActiveTab('aplicaciones')}
          />
        </div>

        {activeTab === 'recomendados' && (
          <section className='min-w-0 space-y-4'>
            {data.vacantes.length === 0 ? (
              <div className='rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] p-6 text-sm text-[var(--color-text-muted)]'>
                {t('sinVacantes')}
              </div>
            ) : (
              <div className='grid min-w-0 grid-cols-1 gap-4 sm:[grid-template-columns:repeat(auto-fit,minmax(min(100%,18rem),1fr))]'>
                {data.vacantes.map((vacante) => (
                  <JobCard
                    key={vacante.id}
                    titulo={vacante.titulo}
                    empresa={vacante.empresa}
                    logoUrl={vacante.logoUrl}
                    modalidad={vacante.modalidad}
                    ubicacion={vacante.ubicacion}
                    matchPorcentaje={vacante.matchPorcentaje}
                    skills={vacante.skills.map((skill) => skill.nombre)}
                    distancia={vacante.distancia}
                    isApplied={appliedVacanteIds.has(vacante.id)}
                    onClick={() => handleAplicar(vacante)}
                    onAplicar={() => handleAplicar(vacante)}
                  />
                ))}
              </div>
            )}
          </section>
        )}

        {activeTab === 'aplicaciones' && (
          <section className='min-w-0 space-y-4'>
            {postulaciones.length === 0 ? (
              <div className='rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] p-6 text-sm text-[var(--color-text-muted)]'>
                {t('sinAplicaciones')}
              </div>
            ) : (
              postulaciones.map((postulacion) => (
                <ApplicationCard
                  key={postulacion.id}
                  titulo={postulacion.titulo}
                  empresa={postulacion.empresa}
                  logoUrl={postulacion.logoUrl}
                  estado={postulacion.estado}
                  matchPorcentaje={postulacion.matchPorcentaje}
                  feedback={postulacion.feedback}
                  skillRechazada={postulacion.skillRechazada}
                  mensajesNuevos={postulacion.mensajesNuevos}
                  onVerMensajes={
                    postulacion.mensajesNuevos > 0 ? () => {} : undefined
                  }
                  onFortalecer={
                    postulacion.skillRechazada
                      ? () => router.push('/formacion')
                      : undefined
                  }
                />
              ))
            )}
          </section>
        )}
      </div>

      {selectedVacante && (
        <JobDetailModal
          open={modalOpen}
          onOpenChange={setModalOpen}
          vacante={selectedVacante}
          onPostular={handlePostular}
          isSubmitting={isSubmitting}
          submitError={submitError}
        />
      )}
    </AppShell>
  );
}

function TabButton({
  active,
  label,
  count,
  onClick,
}: {
  active: boolean;
  label: string;
  count: number;
  onClick: () => void;
}) {
  return (
    <button
      type='button'
      onClick={onClick}
      className={`flex min-w-0 items-center justify-center gap-1.5 rounded-lg px-2.5 py-2 text-xs font-semibold leading-tight transition-colors sm:px-4 sm:text-sm ${
        active
          ? 'bg-[var(--color-primary)] text-white shadow-sm'
          : 'text-[var(--color-text-muted)] hover:bg-[var(--color-primary-pale)] hover:text-[var(--color-primary)]'
      }`}
    >
      <span className='min-w-0 truncate'>{label}</span>
      <span className='shrink-0'>· {count}</span>
    </button>
  );
}
