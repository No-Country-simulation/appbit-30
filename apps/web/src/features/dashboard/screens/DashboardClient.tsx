'use client';

import { useState, useEffect } from 'react';
import { AppShell } from '@/src/components/layout/AppShell';
import { OnboardingModal } from '@/src/features/onboarding/screens/OnboardingModal';
import { HeroBanner } from '../components/HeroBanner';
import { RadarBanner } from '../components/RadarBanner';
import { SkillsGapCard } from '../components/SkillsGapCard';
import { ActionPlanCard } from '../components/ActionPlanCard';
import { WellbeingCard } from '../components/WellbeingCard';
import { SkillsGapModal } from '../components/SkillsGapModal';
import { CheckinModal } from '../components/CheckinModal';
import type { DashboardResponse, SkillsResponse } from '@appbit/shared-schemas';
import type { ActionItem } from '../components/ActionPlanCard';
import type { SkillRow } from '../components/SkillsGapModal';

interface Props {
  nombre: string;
  shouldOpenOnboarding: boolean;
}

export default function DashboardClient({
  nombre: nombreProp,
  shouldOpenOnboarding,
}: Props) {
  const [data, setData] = useState<DashboardResponse | null>(null);
  const [skillsData, setSkillsData] = useState<SkillsResponse | null>(null);
  const [skillsModalOpen, setSkillsModalOpen] = useState(false);
  const [checkinModalOpen, setCheckinModalOpen] = useState(false);
  const [checkinMood, setCheckinMood] = useState('');
  const [checkinStartStep, setCheckinStartStep] = useState<1 | 2 | 3>(1);
  const [onboardingOpen, setOnboardingOpen] = useState(shouldOpenOnboarding);

  useEffect(() => {
    Promise.all([
      fetch('/api/dashboard').then((res) => {
        if (!res.ok) throw new Error('Error al cargar dashboard');
        return res.json() as Promise<DashboardResponse>;
      }),
      fetch('/api/skills').then((res) => {
        if (!res.ok) throw new Error('Error al cargar skills');
        return res.json() as Promise<SkillsResponse>;
      }),
    ])
      .then(([dash, skills]) => {
        setData(dash);
        setSkillsData(skills);
      })
      .catch((err) => console.error('Dashboard fetch error:', err));
  }, []);

  const nombre = data?.usuario?.nombre_completo ?? nombreProp;
  const cursosPendientes =
    data?.planAccion?.filter((p) => !p.completado).length ?? 0;
  const vacantesDisponibles = Array.isArray(
    data?.orientacion?.vacantes_compatibles,
  )
    ? data.orientacion.vacantes_compatibles.length
    : 0;

  const actionItems: ActionItem[] | undefined = data?.planAccion?.map(
    (item) => ({
      title: item.titulo,
      priority: item.completado
        ? ('completado' as const)
        : item.prioridad === 'Alta_prioridad'
          ? ('alta' as const)
          : ('media' as const),
      actionLabel:
        item.accion_label ?? (item.curso ? 'Iniciar curso' : 'Ver temario'),
      actionIcon: item.curso ? ('play' as const) : ('book' as const),
      completed: item.completado,
    }),
  );

  const promedioSemanal = data?.bienestar?.notaPromedio ?? undefined;
  const skillsGapPorcentaje = data?.orientacion?.gap_porcentual ?? undefined;
  const skillsPuesto = Array.isArray(data?.orientacion?.trayectoria_sugerida)
    ? (data.orientacion.trayectoria_sugerida[0] as string | undefined)
    : undefined;

  const skillsRows: SkillRow[] | undefined = skillsData?.habilidades?.map((h) => ({
    habilidad: h.nombre,
    estado: h.estado as SkillRow['estado'],
  }));

  return (
    <AppShell
      onCheckinClick={() => {
        setCheckinMood('');
        setCheckinStartStep(1);
        setCheckinModalOpen(true);
      }}
    >
      <div className='space-y-6'>
        <HeroBanner
          nombre={nombre}
          cursosPendientes={cursosPendientes}
          vacantesDisponibles={vacantesDisponibles}
        />

        <RadarBanner vacantesCompatibles={vacantesDisponibles} />

        <div className='grid grid-cols-1 gap-6 lg:grid-cols-3'>
          <SkillsGapCard
            porcentaje={skillsGapPorcentaje}
            puesto={skillsPuesto}
            onVerDetalles={() => setSkillsModalOpen(true)}
          />
          <ActionPlanCard items={actionItems} />
          <WellbeingCard
            promedioSemanal={promedioSemanal}
            onEmojiClick={(moodId) => {
              setCheckinMood(moodId);
              setCheckinStartStep(2);
              setCheckinModalOpen(true);
            }}
          />
        </div>
      </div>

      {onboardingOpen && <OnboardingModal defaultOpen locked />}

      <SkillsGapModal
        open={skillsModalOpen}
        onOpenChange={setSkillsModalOpen}
        puesto={skillsPuesto}
        porcentaje={skillsGapPorcentaje}
        skills={skillsRows}
      />

      <CheckinModal
        open={checkinModalOpen}
        onOpenChange={(v) => {
          setCheckinModalOpen(v);
          if (!v) {
            setCheckinMood('');
            setCheckinStartStep(1);
          }
        }}
        initialMood={checkinMood}
        startAtStep={checkinStartStep}
      />
    </AppShell>
  );
}
