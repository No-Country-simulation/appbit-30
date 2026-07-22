'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from '@/src/i18n/navigation';
import { useTranslations } from 'next-intl';
import { AppShell } from '@/src/components/layout/AppShell';
import { OnboardingModal } from '@/src/features/onboarding/screens/OnboardingModal';
import { HeroBanner } from '../components/HeroBanner';
import { SkillsGapCard } from '../components/SkillsGapCard';
import { ActionPlanCard } from '../components/ActionPlanCard';
import { WellbeingCard } from '../components/WellbeingCard';
import { SkillsGapModal } from '../components/SkillsGapModal';
import { CheckinModal } from '../components/CheckinModal';
import { ProgressHistoryModal } from '../components/ProgressHistoryModal';
import type {
  DashboardResponse,
  ProgressHistoryResponse,
  SkillsResponse,
} from '@appbit/shared-schemas';
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

const AREA_LABEL_KEYS = {
  Data_Analytics: 'areasInteresOption1',
  Desarrollo_Web: 'areasInteresOption2',
  UX_UI_Design: 'areasInteresOption3',
  Ciberseguridad: 'areasInteresOption4',
  Cloud_DevOps: 'areasInteresOption5',
  Inteligencia_Artificial: 'areasInteresOption6',
  Marketing_Digital: 'areasInteresOption7',
  Product_Management: 'areasInteresOption8',
} as const;

function formatAreaValue(area: string) {
  return area.replaceAll('_', ' ');
}

function compactAreaList(labels: string[]) {
  if (labels.length <= 2) {
    return labels.join(' + ');
  }

  return `${labels.slice(0, 2).join(' + ')} +${labels.length - 2}`;
}

function normalizeSkillStatus(status: string): SkillRow['estado'] {
  if (status === 'Adquirida' || status === 'acquired') {
    return 'acquired';
  }

  if (
    status === 'En progreso' ||
    status === 'En_progreso' ||
    status === 'in_progress'
  ) {
    return 'in_progress';
  }

  if (status === 'Faltante' || status === 'missing') {
    return 'missing';
  }

  return 'missing';
}

const SKILL_STATUS_ORDER: Record<SkillRow['estado'], number> = {
  missing: 0,
  in_progress: 1,
  acquired: 2,
};

export default function DashboardClient({
  nombre: nombreProp,
  shouldOpenOnboarding,
}: Props) {
  const router = useRouter();
  const t = useTranslations('Dashboard');
  const tOnboarding = useTranslations('Onboarding');

  const [data, setData] = useState<DashboardResponse | null>(null);
  const [skillsData, setSkillsData] = useState<SkillsResponse | null>(null);
  const [isLoadingSkills, setIsLoadingSkills] = useState(false);
  const [progressHistory, setProgressHistory] =
    useState<ProgressHistoryResponse | null>(null);
  const [isLoadingProgressHistory, setIsLoadingProgressHistory] = useState(false);
  const [progressHistoryError, setProgressHistoryError] = useState(false);

  const [onboardingCompletedClient, setOnboardingCompletedClient] =
    useState(false);

  const shouldShowOnboarding =
    shouldOpenOnboarding && !onboardingCompletedClient;

  const [isLoadingDashboard, setIsLoadingDashboard] = useState(
    () => !shouldShowOnboarding,
  );

  const [dashboardError, setDashboardError] = useState(false);

  const [skillsModalOpen, setSkillsModalOpen] = useState(false);
  const [progressHistoryModalOpen, setProgressHistoryModalOpen] = useState(false);
  const [checkinModalOpen, setCheckinModalOpen] = useState(false);
  const [checkinMood, setCheckinMood] = useState('');
  const [checkinStartStep, setCheckinStartStep] = useState<1 | 2 | 3>(1);
  const [checkinModalKey, setCheckinModalKey] = useState(0);

  const loadSkills = useCallback(async () => {
    if (skillsData || isLoadingSkills) {
      return;
    }

    setIsLoadingSkills(true);

    try {
      const skills = await fetchJson<SkillsResponse>('/api/skills');
      setSkillsData(skills);
    } catch (error) {
      console.error('Error fetching skills data:', error);
    } finally {
      setIsLoadingSkills(false);
    }
  }, [skillsData, isLoadingSkills]);

  const loadProgressHistory = useCallback(async (force = false) => {
    if ((!force && progressHistory) || isLoadingProgressHistory) return;

    setIsLoadingProgressHistory(true);
    setProgressHistoryError(false);

    try {
      const history = await fetchJson<ProgressHistoryResponse>(
        '/api/dashboard/progress-history?months=4',
      );
      setProgressHistory(history);
    } catch (error) {
      console.error('Error fetching progress history:', error);
      setProgressHistoryError(true);
    } finally {
      setIsLoadingProgressHistory(false);
    }
  }, [isLoadingProgressHistory, progressHistory]);

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
          const dash = await fetchJson<DashboardResponse>(
            `/api/dashboard?timezone=${encodeURIComponent(
              Intl.DateTimeFormat().resolvedOptions().timeZone,
            )}`,
          );

          setData(dash);
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
    data?.planAccion?.map((item) => {
      const completed = Boolean(item.completado);

      return {
        id: item.plan_item_id,
        title: item.titulo,
        priority: completed
          ? ('completado' as const)
          : item.prioridad === 'Alta_prioridad'
            ? ('alta' as const)
            : item.prioridad === 'Media_prioridad'
              ? ('media' as const)
              : ('baja' as const),
        actionLabel:
          item.accion_label ??
          (item.curso?.hasInternalContent
            ? t('continuar')
            : item.curso?.url_externa
              ? t('abrirCurso')
              : t('verFormacion')),
        actionIcon: item.curso?.hasInternalContent
          ? ('play' as const)
          : item.curso?.url_externa
            ? ('external' as const)
            : ('book' as const),
        completed,
        curso: item.curso ?? null,
      };
    }) ?? [];

  const promedioSemanal = isLoadingDashboard
    ? undefined
    : (data?.bienestar?.notaPromedio ?? 0);

  function clampPercent(value: number) {
    return Math.max(0, Math.min(100, Math.round(value)));
  }

  const skillsMatchFromUserSkills =
    skillsData?.resumen.matchActual ?? undefined;

  const orientacionGapPorcentual =
    data?.orientacion?.gap_porcentual ??
    skillsData?.orientacion?.gap_porcentual ??
    null;

  const skillsMatchPorcentaje = isLoadingDashboard
    ? undefined
    : data?.progressHistorySummary?.currentMatch != null
      ? clampPercent(data.progressHistorySummary.currentMatch)
      : skillsMatchFromUserSkills != null
        ? clampPercent(skillsMatchFromUserSkills)
        : orientacionGapPorcentual != null
          ? clampPercent(100 - Number(orientacionGapPorcentual))
          : undefined;

  const areaValuesFromDashboard = data?.areasInteres ?? [];

  const areaValuesFromSkills = Array.from(
    new Set(
      (skillsData?.habilidades ?? [])
        .map((skill) => skill.area_principal)
        .filter((area): area is string => Boolean(area)),
    ),
  );

  const selectedAreaValues =
    areaValuesFromDashboard.length > 0
      ? areaValuesFromDashboard
      : areaValuesFromSkills;

  const selectedAreaLabels = selectedAreaValues.map((area) => {
    const labelKey = AREA_LABEL_KEYS[area as keyof typeof AREA_LABEL_KEYS];

    return labelKey ? tOnboarding(labelKey as never) : formatAreaValue(area);
  });

  const aiSuggestedRole = Array.isArray(data?.orientacion?.trayectoria_sugerida)
    ? (data.orientacion.trayectoria_sugerida[0] as string | undefined)
    : Array.isArray(skillsData?.orientacion?.trayectoria_sugerida)
      ? (skillsData.orientacion.trayectoria_sugerida[0] as string | undefined)
      : undefined;

  const skillsPuesto =
    selectedAreaLabels.length > 1
      ? compactAreaList(selectedAreaLabels)
      : (selectedAreaLabels[0] ??
        aiSuggestedRole ??
        t('skillsGapFallbackPuesto'));

  const skillsRows: SkillRow[] =
    skillsData?.habilidades
      ?.map((h) => ({
        habilidad: h.nombre,
        estado: normalizeSkillStatus(h.estado),
      }))
      .sort((a, b) => {
        const statusDiff =
          SKILL_STATUS_ORDER[a.estado] - SKILL_STATUS_ORDER[b.estado];

        if (statusDiff !== 0) {
          return statusDiff;
        }

        return a.habilidad.localeCompare(b.habilidad, undefined, {
          sensitivity: 'base',
        });
      }) ?? [];

  const perfilCompletado = isLoadingDashboard
    ? undefined
    : (data?.perfil_completado ?? 0);

  const perfilBreakdown = isLoadingDashboard
    ? undefined
    : data?.perfil_breakdown;

  const hasCheckinToday = data?.bienestar?.hasCheckinToday ?? false;
  const todayCheckin = data?.bienestar?.todayCheckin ?? null;

  function handleActionPlanItemClick(item: {
    curso?: {
      curso_id?: string | null;
      url_externa?: string | null;
      hasInternalContent?: boolean | null;
    } | null;
  }) {
    const curso = item.curso;

    if (!curso) {
      router.push('/formacion');
      return;
    }

    if (curso.hasInternalContent && curso.curso_id) {
      router.push(`/formacion/${curso.curso_id}`);
      return;
    }

    if (curso.url_externa) {
      window.open(curso.url_externa, '_blank', 'noopener,noreferrer');
      return;
    }

    router.push('/formacion');
  }

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

        {/* <RadarBanner
          vacantesCompatibles={vacantesDisponibles}
          isLoading={isLoadingDashboard}
        /> */}

        <div className='grid min-w-0 grid-cols-1 gap-4 md:gap-5 xl:grid-cols-12'>
          <div className='xl:col-span-4'>
            <SkillsGapCard
              porcentaje={skillsMatchPorcentaje}
              puesto={skillsPuesto}
              isLoading={isLoadingDashboard}
              onVerDetalles={() => {
                setSkillsModalOpen(true);
                void loadSkills();
              }}
              historySummary={data?.progressHistorySummary}
              onVerHistorial={() => {
                setProgressHistoryModalOpen(true);
                void loadProgressHistory(true);
              }}
            />
          </div>

          <div className='xl:col-span-5'>
            <ActionPlanCard
              items={actionItems}
              isLoading={isLoadingDashboard}
              onItemClick={handleActionPlanItemClick}
            />
          </div>

          <div className='xl:col-span-3'>
            <WellbeingCard
              promedioSemanal={promedioSemanal}
              isLoading={isLoadingDashboard}
              hasCheckinToday={hasCheckinToday}
              todayCheckin={todayCheckin}
              onHistoryClick={() => router.push('/bienestar')}
              onEmojiClick={(moodId) => {
                if (hasCheckinToday) {
                  return;
                }

                setCheckinMood(moodId);
                setCheckinStartStep(2);
                setCheckinModalKey((key) => key + 1);
                setCheckinModalOpen(true);
              }}
            />
          </div>
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
        onOpenChange={(nextOpen) => {
          setSkillsModalOpen(nextOpen);

          if (nextOpen) {
            void loadSkills();
          }
        }}
        puesto={skillsPuesto}
        porcentaje={skillsMatchPorcentaje}
        skills={skillsRows}
        isLoading={isLoadingDashboard || isLoadingSkills}
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

      <ProgressHistoryModal
        open={progressHistoryModalOpen}
        onOpenChange={(nextOpen) => {
          setProgressHistoryModalOpen(nextOpen);

          if (nextOpen) {
            void loadProgressHistory(true);
          }
        }}
        data={progressHistory}
        isLoading={isLoadingProgressHistory}
        hasError={progressHistoryError}
      />
    </AppShell>
  );
}
