'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Loader2 } from 'lucide-react';
import { AppShell } from '@/src/components/layout/AppShell';
import { TabBar } from '@/src/components/app/TabBar';
import { JobCard } from '../components/JobCard';
import { ApplicationCard } from '../components/ApplicationCard';
import { JobDetailModal } from '../components/JobDetailModal';
import type { VacanteItem, PostulacionItem } from '@appbit/shared-schemas';

export default function EmployabilityClient() {
  const t = useTranslations('Empleabilidad');
  const [activeTab, setActiveTab] = useState('recomendados');
  const [selectedVacante, setSelectedVacante] = useState<VacanteItem | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [vacantes, setVacantes] = useState<VacanteItem[]>([]);
  const [postulaciones, setPostulaciones] = useState<PostulacionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const [vacRes, postRes] = await Promise.all([
          fetch('/api/vacantes'),
          fetch('/api/postulaciones'),
        ]);

        if (!vacRes.ok) throw new Error('Error al cargar vacantes');
        if (!postRes.ok) throw new Error('Error al cargar postulaciones');

        const vacData = await vacRes.json();
        const postData = await postRes.json();

        setVacantes(vacData.vacantes);
        setPostulaciones(postData.postulaciones);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar datos');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  function handleAplicar(vacante: VacanteItem) {
    setSelectedVacante(vacante);
    setModalOpen(true);
  }

  async function handlePostular(data: { mensaje_motivacion: string; usar_cv_guardado: boolean }) {
    if (!selectedVacante) return;

    setModalOpen(false);
    setSuccessMessage(t('postulacionExitosa'));
    setTimeout(() => setSuccessMessage(null), 3000);

    try {
      await fetch('/api/postulaciones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vacante_id: selectedVacante.id,
          mensaje_motivacion: data.mensaje_motivacion || undefined,
          usar_cv_guardado: data.usar_cv_guardado,
        }),
      });
    } catch {
      // Silently fail — user already saw success message
    }
  }

  if (loading) {
    return (
      <AppShell>
        <div className='flex items-center justify-center py-20'>
          <Loader2 className='size-8 animate-spin text-[var(--color-primary)]' />
        </div>
      </AppShell>
    );
  }

  if (error) {
    return (
      <AppShell>
        <div className='rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600'>
          {error}
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className='space-y-6'>
        <h1 className='text-2xl font-bold text-[var(--color-text)]'>
          {t('title')}
        </h1>

        {successMessage && (
          <div className='rounded-lg bg-[var(--color-success-bg)] px-4 py-3 text-sm text-[var(--color-success-text)]'>
            {successMessage}
          </div>
        )}

        <TabBar
          tabs={[
            { id: 'recomendados', label: t('recomendados'), count: vacantes.length },
            { id: 'aplicaciones', label: t('misAplicaciones'), count: postulaciones.length },
          ]}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />

        {activeTab === 'recomendados' && (
          <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3'>
            {vacantes.map((v) => (
              <JobCard
                key={v.id}
                titulo={v.titulo}
                empresa={v.empresa}
                logoUrl={v.logoUrl ?? undefined}
                modalidad={v.modalidad}
                ubicacion={v.ubicacion}
                matchPorcentaje={v.matchPorcentaje}
                skills={v.skills.map((s) => s.nombre)}
                distancia={v.distancia ?? undefined}
                onClick={() => handleAplicar(v)}
                onAplicar={() => handleAplicar(v)}
              />
            ))}
          </div>
        )}

        {activeTab === 'aplicaciones' && (
          <div className='space-y-4'>
            {postulaciones.map((p) => (
              <ApplicationCard
                key={p.id}
                titulo={p.titulo}
                empresa={p.empresa}
                logoUrl={p.logoUrl ?? undefined}
                estado={p.estado}
                matchPorcentaje={p.matchPorcentaje ?? undefined}
                feedback={p.feedback ?? undefined}
                skillRechazada={p.skillRechazada ?? undefined}
                mensajesNuevos={p.mensajesNuevos}
                onVerMensajes={p.mensajesNuevos > 0 ? () => {} : undefined}
                onFortalecer={p.skillRechazada ? () => {} : undefined}
              />
            ))}
          </div>
        )}
      </div>

      {selectedVacante && (
        <JobDetailModal
          open={modalOpen}
          onOpenChange={setModalOpen}
          vacante={selectedVacante}
          onPostular={handlePostular}
        />
      )}
    </AppShell>
  );
}
