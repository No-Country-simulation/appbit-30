'use client';

import { useCallback, useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
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

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url, {
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error(`Error loading ${url}`);
  }

  return response.json() as Promise<T>;
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function hasGeneratedRecommendations(dashboard: DashboardResponse) {
  return dashboard.planAccion.length > 0;
}

export default function DashboardClient({
  nombre: nombreProp,
  shouldOpenOnboarding,
}: Props) {
  const t = useTranslations('Dashboard');

  const [data, setData] = useState<DashboardResponse | null>(null);
  const [skillsData, setSkillsData] = useState<SkillsResponse | null>(null);

  const [onboardingCompletedClient, setOnboardingCompletedClient] =
    useState(false);

  const shouldShowOnboarding =
    shouldOpenOnboarding && !onboardingCompletedClient;

  const [isLoadingDashboard, setIsLoadingDashboard] = useState(
    () => !shouldShowOnboarding,
  );

  const [dashboardError, setDashboardError] = useState(false);

  const [skillsModalOpen, setSkillsModalOpen] = useState(false);
  const [checkinModalOpen, setCheckinModalOpen] = useState(false);
  const [checkinMood, setCheckinMood] = useState('');
  const [checkinStartStep, setCheckinStartStep] = useState<1 | 2 | 3>(1);
  const [checkinModalKey, setCheckinModalKey] = useState(0);

  const loadDashboard = useCallback(
    async (
      options: {
        waitForRecommendations?: boolean;
        force?: boolean;
      } = {},
    ) => {
      if (shouldShowOnboarding && !options.force) {
        return;
      }

      const maxAttempts = options.waitForRecommendations ? 12 : 1;
      const delayMs = 1500;

      try {
        for (let attempt = 1; attempt <= maxAttempts; attempt++) {
          const [dash, skills] = await Promise.all([
            fetchJson<DashboardResponse>('/api/dashboard'),
            fetchJson<SkillsResponse>('/api/skills'),
          ]);

          setData(dash);
          setSkillsData(skills);
          setDashboardError(false);

          if (
            !options.waitForRecommendations ||
            hasGeneratedRecommendations(dash)
          ) {
            break;
          }

          if (attempt < maxAttempts) {
            await sleep(delayMs);
          }
        }
      } catch (error) {
        console.error('Dashboard fetch error:', error);
        setDashboardError(true);
      } finally {
        setIsLoadingDashboard(false);
      }
    },
    [shouldShowOnboarding],
  );

  useEffect(() => {
    if (shouldOpenOnboarding) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      void loadDashboard();
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [loadDashboard, shouldOpenOnboarding]);

  async function handleOnboardingCompleted() {
    setOnboardingCompletedClient(true);
    setData(null);
    setSkillsData(null);
    setDashboardError(false);
    setIsLoadingDashboard(true);

    await loadDashboard({
      force: true,
      waitForRecommendations: true,
    });

    if (typeof window !== 'undefined') {
      window.history.replaceState(null, '', window.location.pathname);
    }
  }

  const nombre = data?.usuario?.nombre_completo ?? nombreProp;
  const avatarUrl = data?.usuario?.avatar_url ?? null;

  const cursosPendientes = isLoadingDashboard
    ? undefined
    : (data?.planAccion?.filter((p) => !p.completado).length ?? 0);

  const vacantesDisponibles = isLoadingDashboard
    ? undefined
    : Array.isArray(data?.orientacion?.vacantes_compatibles)
      ? data.orientacion.vacantes_compatibles.length
      : 0;

  const actionItems: ActionItem[] =
    data?.planAccion?.map((item) => ({
      title: item.titulo,
      priority: item.completado
        ? ('completado' as const)
        : item.prioridad === 'Alta_prioridad'
          ? ('alta' as const)
          : ('media' as const),
      actionLabel:
        item.accion_label ??
        (item.curso ? t('actionLabelIniciar') : t('actionLabelVerTemario')),
      actionIcon: item.curso ? ('play' as const) : ('book' as const),
      completed: item.completado,
    })) ?? [];

  const promedioSemanal = isLoadingDashboard
    ? undefined
    : (data?.bienestar?.notaPromedio ?? 0);

  const skillsGapFromUserSkills = (() => {
    const resumen = skillsData?.resumen;

    if (!resumen) {
      return undefined;
    }

    const total = resumen.adquiridas + resumen.faltantes + resumen.enProgreso;

    if (total === 0) {
      return undefined;
    }

    return Math.round((resumen.faltantes / total) * 100);
  })();

  const skillsGapPorcentaje = isLoadingDashboard
    ? undefined
    : (data?.orientacion?.gap_porcentual ??
      skillsData?.orientacion?.gap_porcentual ??
      skillsGapFromUserSkills);

  const skillsPuesto = Array.isArray(data?.orientacion?.trayectoria_sugerida)
    ? (data.orientacion.trayectoria_sugerida[0] as string | undefined)
    : Array.isArray(skillsData?.orientacion?.trayectoria_sugerida)
      ? (skillsData.orientacion.trayectoria_sugerida[0] as string | undefined)
      : undefined;

  const skillsRows: SkillRow[] =
    skillsData?.habilidades?.map((h) => ({
      habilidad: h.nombre,
      estado: h.estado as SkillRow['estado'],
    })) ?? [];

  const perfilCompletado = isLoadingDashboard
    ? undefined
    : (data?.perfil_completado ?? 0);

  const perfilBreakdown = isLoadingDashboard
    ? undefined
    : data?.perfil_breakdown;

  return (
    <AppShell
      onCheckinClick={() => {
        setCheckinMood('');
        setCheckinStartStep(1);
        setCheckinModalKey((key) => key + 1);
        setCheckinModalOpen(true);
      }}
      userName={nombre}
      avatarUrl={avatarUrl}
      profilePercent={perfilCompletado}
      perfilBreakdown={perfilBreakdown}
    >
      <div className='space-y-6'>
        {dashboardError && (
          <div className='rounded-[var(--radius-md)] border border-[var(--color-danger)] bg-[var(--color-danger-bg)] p-4 text-sm text-[var(--color-danger-text)]'>
            {t('dashboardLoadError')}
          </div>
        )}

        <HeroBanner
          nombre={nombre}
          cursosPendientes={cursosPendientes}
          vacantesDisponibles={vacantesDisponibles}
          isLoading={isLoadingDashboard}
        />

        <RadarBanner
          vacantesCompatibles={vacantesDisponibles}
          isLoading={isLoadingDashboard}
        />

        <div className='grid grid-cols-1 gap-6 lg:grid-cols-3'>
          <SkillsGapCard
            porcentaje={skillsGapPorcentaje}
            puesto={skillsPuesto}
            isLoading={isLoadingDashboard}
            onVerDetalles={() => setSkillsModalOpen(true)}
          />

          <ActionPlanCard items={actionItems} isLoading={isLoadingDashboard} />

          <WellbeingCard
            promedioSemanal={promedioSemanal}
            isLoading={isLoadingDashboard}
            onEmojiClick={(moodId) => {
              setCheckinMood(moodId);
              setCheckinStartStep(2);
              setCheckinModalKey((key) => key + 1);
              setCheckinModalOpen(true);
            }}
          />
        </div>
      </div>

      {shouldShowOnboarding && (
        <OnboardingModal
          defaultOpen
          locked
          onCompleted={handleOnboardingCompleted}
        />
      )}

      <SkillsGapModal
        open={skillsModalOpen}
        onOpenChange={setSkillsModalOpen}
        puesto={skillsPuesto}
        porcentaje={skillsGapPorcentaje}
        skills={skillsRows}
        isLoading={isLoadingDashboard}
      />

      <CheckinModal
        key={checkinModalKey}
        open={checkinModalOpen}
        onOpenChange={(nextOpen) => {
          setCheckinModalOpen(nextOpen);

          if (!nextOpen) {
            setCheckinMood('');
            setCheckinStartStep(1);
          }
        }}
        initialMood={checkinMood}
        startAtStep={checkinStartStep}
        onSaved={() =>
          loadDashboard({
            force: true,
          })
        }
      />
    </AppShell>
  );
}
