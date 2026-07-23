'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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
import type { DashboardResponse, SkillsResponse } from '@appbit/shared-schemas';
import type { ActionItem } from '../components/ActionPlanCard';
import type { SkillRow } from '../components/SkillsGapModal';

interface Props {
  nombre: string;
  shouldOpenOnboarding: boolean;
}

type AiRecommendationsStatus = 'generating' | 'ready' | 'fallback';

type DashboardClientResponse = DashboardResponse & {
  aiRecommendationsReady?: boolean;
  aiRecommendationsStatus?: AiRecommendationsStatus;
};

async function fetchJson<T>(
  url: string,
  options: {
    timeoutMs?: number;
  } = {},
): Promise<T> {
  const controller = new AbortController();
  const timeoutId = window.setTimeout(
    () => controller.abort(),
    options.timeoutMs ?? 8000,
  );

  try {
    const response = await fetch(url, {
      cache: 'no-store',
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`Error loading ${url}`);
    }

    return response.json() as Promise<T>;
  } finally {
    window.clearTimeout(timeoutId);
  }
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getAiRecommendationsStatus(
  dashboard: DashboardClientResponse | null | undefined,
): AiRecommendationsStatus {
  return dashboard?.aiRecommendationsStatus ?? 'ready';
}

function hasResolvedRecommendations(dashboard: DashboardClientResponse) {
  return getAiRecommendationsStatus(dashboard) !== 'generating';
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

type DashboardHero = {
  titleKey:
    | 'heroWellbeingTitle'
    | 'heroJobsTitle'
    | 'heroProgressTitle'
    | 'heroStartTitle';
  descriptionKey:
    | 'heroWellbeingDescription'
    | 'heroJobsDescription'
    | 'heroProgressDescription'
    | 'heroStartDescription'
    | 'heroStartNoSkillsDescription';
  tone: 'default' | 'learning' | 'jobs' | 'wellbeing';
  values: Record<string, string | number | undefined>;
  primaryLabelKey: 'heroCtaWellbeing' | 'heroCtaJobs' | 'heroCtaLearning';
  primaryHref: string;
  secondaryLabelKey?: 'heroCtaPlan' | 'heroCtaContinueProgress';
  secondaryHref?: string;
};

function getFirstName(name: string) {
  return name.trim().split(/\s+/)[0] || name;
}

function getArrayLength(value: unknown) {
  return Array.isArray(value) ? value.length : 0;
}

function compactTranslationValues(values: DashboardHero['values']) {
  return Object.fromEntries(
    Object.entries(values).filter(([, value]) => value !== undefined),
  ) as Record<string, string | number>;
}

function clampPercent(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

const ONBOARDING_DASHBOARD_CLICK_KEY = 'appbit:onboarding-dashboard-click-ms';

const DASHBOARD_PERF_LOGS_ENABLED =
  process.env.NEXT_PUBLIC_DASHBOARD_PERF_LOGS === 'true';

function getNowMs() {
  return Math.round(performance.now());
}

function readStoredDashboardClickMs() {
  if (typeof window === 'undefined') {
    return null;
  }

  const raw = window.sessionStorage.getItem(ONBOARDING_DASHBOARD_CLICK_KEY);

  if (!raw) {
    return null;
  }

  const value = Number(raw);

  return Number.isFinite(value) ? value : null;
}

function getDashboardClickDeltaMs() {
  const startedAt = readStoredDashboardClickMs();

  return startedAt != null ? Math.round(performance.now() - startedAt) : null;
}

function clearStoredDashboardClick() {
  if (typeof window === 'undefined') {
    return;
  }

  window.sessionStorage.removeItem(ONBOARDING_DASHBOARD_CLICK_KEY);
}

function getPerfErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return String(error);
}

function logDashboardPerf(
  event: string,
  context: Record<string, unknown> = {},
) {
  if (!DASHBOARD_PERF_LOGS_ENABLED) {
    return;
  }

  console.info(
    JSON.stringify({
      scope: 'dashboard-perf',
      event,
      atMs: getNowMs(),
      fromOnboardingClickMs: getDashboardClickDeltaMs(),
      ...context,
    }),
  );
}

function PlanGeneratingCard({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className='rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-sm'>
      <p className='text-sm font-semibold text-[var(--color-text)]'>{title}</p>
      <p className='mt-2 text-sm text-[var(--color-muted)]'>{description}</p>

      <div className='mt-4 space-y-2'>
        <div className='h-3 w-3/4 animate-pulse rounded-full bg-[var(--color-border)]' />
        <div className='h-3 w-2/3 animate-pulse rounded-full bg-[var(--color-border)]' />
        <div className='h-3 w-1/2 animate-pulse rounded-full bg-[var(--color-border)]' />
      </div>
    </div>
  );
}

export default function DashboardClient({
  nombre: nombreProp,
  shouldOpenOnboarding,
}: Props) {
  const router = useRouter();
  const t = useTranslations('Dashboard');
  const tOnboarding = useTranslations('Onboarding');

  const [data, setData] = useState<DashboardClientResponse | null>(null);
  const [skillsData, setSkillsData] = useState<SkillsResponse | null>(null);
  const [isLoadingSkills, setIsLoadingSkills] = useState(false);

  const [onboardingCompletedClient, setOnboardingCompletedClient] =
    useState(false);

  const shouldShowOnboarding =
    shouldOpenOnboarding && !onboardingCompletedClient;

  const hasDashboardDataRef = useRef(false);
  const [isRefreshingDashboard, setIsRefreshingDashboard] = useState(false);

  const [dashboardError, setDashboardError] = useState(false);

  const isInitialDashboardLoading =
    !shouldShowOnboarding && !data && !dashboardError;

  const [skillsModalOpen, setSkillsModalOpen] = useState(false);
  const [checkinModalOpen, setCheckinModalOpen] = useState(false);
  const [checkinMood, setCheckinMood] = useState('');
  const [checkinStartStep, setCheckinStartStep] = useState<1 | 2 | 3>(1);
  const [checkinModalKey, setCheckinModalKey] = useState(0);

  const dashboardShellLoggedRef = useRef(false);
  const dashboardDataLoggedRef = useRef(false);
  const aiRefreshScheduledRef = useRef(false);
  const aiRefreshTimeoutsRef = useRef<number[]>([]);

  const clearAiRefreshTimeouts = useCallback(() => {
    aiRefreshTimeoutsRef.current.forEach((timeoutId) => {
      window.clearTimeout(timeoutId);
    });
    aiRefreshTimeoutsRef.current = [];
  }, []);

  const loadSkills = useCallback(async () => {
    if (skillsData || isLoadingSkills) {
      return;
    }

    const startedAt = performance.now();

    logDashboardPerf('skills_fetch_start');
    setIsLoadingSkills(true);

    try {
      const skills = await fetchJson<SkillsResponse>('/api/skills');
      setSkillsData(skills);

      logDashboardPerf('skills_fetch_success', {
        durationMs: Math.round(performance.now() - startedAt),
        skillsCount: skills.habilidades.length,
      });
    } catch (error) {
      console.error('Error fetching skills data:', error);

      logDashboardPerf('skills_fetch_error', {
        durationMs: Math.round(performance.now() - startedAt),
        message: getPerfErrorMessage(error),
      });
    } finally {
      setIsLoadingSkills(false);
    }
  }, [skillsData, isLoadingSkills]);

  const retryRecommendationsInBackground = useCallback(async () => {
    const maxAttempts = 4;
    const delayMs = 1500;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      await sleep(delayMs);

      const startedAt = performance.now();

      logDashboardPerf('dashboard_background_retry_start', { attempt });

      try {
        const dash = await fetchJson<DashboardClientResponse>(
          `/api/dashboard?timezone=${encodeURIComponent(
            Intl.DateTimeFormat().resolvedOptions().timeZone,
          )}`,
          { timeoutMs: 8000 },
        );

        hasDashboardDataRef.current = true;
        setData(dash);
        setDashboardError(false);

        logDashboardPerf('dashboard_background_retry_success', {
          attempt,
          durationMs: Math.round(performance.now() - startedAt),
          requestId: dash.requestId,
          planItems: dash.planAccion.length,
          aiRecommendationsStatus: getAiRecommendationsStatus(dash),
        });

        if (hasResolvedRecommendations(dash)) {
          break;
        }
      } catch (error) {
        console.warn(
          'Dashboard background recommendation refresh failed:',
          error,
        );

        logDashboardPerf('dashboard_background_retry_error', {
          attempt,
          durationMs: Math.round(performance.now() - startedAt),
          message: getPerfErrorMessage(error),
        });

        break;
      }
    }
  }, []);

  const loadDashboard = useCallback(
    async (
      options: {
        waitForRecommendations?: boolean;
        force?: boolean;
      } = {},
    ) => {
      if (shouldShowOnboarding && !options.force) {
        logDashboardPerf('dashboard_fetch_skipped_onboarding_open', {
          force: Boolean(options.force),
        });

        return;
      }

      const hasExistingData = hasDashboardDataRef.current;
      const fetchStartedAt = performance.now();

      logDashboardPerf('dashboard_fetch_start', {
        hasExistingData,
        force: Boolean(options.force),
        waitForRecommendations: Boolean(options.waitForRecommendations),
      });

      if (hasExistingData) {
        setIsRefreshingDashboard(true);
      }

      try {
        const dash = await fetchJson<DashboardClientResponse>(
          `/api/dashboard?timezone=${encodeURIComponent(
            Intl.DateTimeFormat().resolvedOptions().timeZone,
          )}`,
          { timeoutMs: 8000 },
        );

        logDashboardPerf('dashboard_fetch_success', {
          durationMs: Math.round(performance.now() - fetchStartedAt),
          requestId: dash.requestId,
          planItems: dash.planAccion.length,
          degradedSections: dash.degradedSections,
          hasCheckinToday: dash.bienestar.hasCheckinToday,
          aiRecommendationsStatus: getAiRecommendationsStatus(dash),
        });

        hasDashboardDataRef.current = true;
        setData(dash);
        setDashboardError(false);

        logDashboardPerf('dashboard_state_set', {
          durationMs: Math.round(performance.now() - fetchStartedAt),
        });

        if (
          options.waitForRecommendations &&
          !hasResolvedRecommendations(dash)
        ) {
          logDashboardPerf(
            'dashboard_recommendations_background_retry_scheduled',
          );

          void retryRecommendationsInBackground();
        }
      } catch (error) {
        console.error('Dashboard fetch error:', error);

        logDashboardPerf('dashboard_fetch_error', {
          durationMs: Math.round(performance.now() - fetchStartedAt),
          message: getPerfErrorMessage(error),
        });

        setDashboardError(true);
      } finally {
        setIsRefreshingDashboard(false);
      }
    },
    [retryRecommendationsInBackground, shouldShowOnboarding],
  );

  useEffect(() => {
    return () => {
      clearAiRefreshTimeouts();
    };
  }, [clearAiRefreshTimeouts]);

  useEffect(() => {
    const status = getAiRecommendationsStatus(data);

    if (status !== 'generating') {
      aiRefreshScheduledRef.current = false;
      clearAiRefreshTimeouts();
      return;
    }

    if (aiRefreshScheduledRef.current) {
      return;
    }

    aiRefreshScheduledRef.current = true;

    const refreshDelaysMs = [4000, 9000, 15000, 23000, 35000, 50000, 65000];

    aiRefreshTimeoutsRef.current = refreshDelaysMs.map((delayMs) =>
      window.setTimeout(() => {
        void loadDashboard({
          force: true,
          waitForRecommendations: false,
        });
      }, delayMs),
    );
  }, [clearAiRefreshTimeouts, data, loadDashboard]);

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

  useEffect(() => {
    if (shouldShowOnboarding || dashboardShellLoggedRef.current) {
      return;
    }

    dashboardShellLoggedRef.current = true;

    logDashboardPerf('dashboard_shell_rendered', {
      hasInitialData: Boolean(data),
      isInitialDashboardLoading,
    });
  }, [data, isInitialDashboardLoading, shouldShowOnboarding]);

  useEffect(() => {
    if (!data || dashboardDataLoggedRef.current) {
      return;
    }

    dashboardDataLoggedRef.current = true;

    let firstRaf = 0;
    let secondRaf = 0;

    firstRaf = window.requestAnimationFrame(() => {
      secondRaf = window.requestAnimationFrame(() => {
        logDashboardPerf('dashboard_first_useful_paint', {
          planItems: data.planAccion.length,
          hasCheckinToday: data.bienestar.hasCheckinToday,
          degradedSections: data.degradedSections,
          aiRecommendationsStatus: getAiRecommendationsStatus(data),
        });

        clearStoredDashboardClick();
      });
    });

    return () => {
      window.cancelAnimationFrame(firstRaf);
      window.cancelAnimationFrame(secondRaf);
    };
  }, [data]);

  function handleOnboardingCompleted() {
    logDashboardPerf('onboarding_completed_received_by_dashboard_client');

    setOnboardingCompletedClient(true);
    setData(null);
    setSkillsData(null);
    setDashboardError(false);
    hasDashboardDataRef.current = false;
    dashboardShellLoggedRef.current = false;
    dashboardDataLoggedRef.current = false;
    aiRefreshScheduledRef.current = false;
    clearAiRefreshTimeouts();

    void loadDashboard({
      force: true,
      waitForRecommendations: true,
    });

    logDashboardPerf('dashboard_load_scheduled_after_onboarding');

    if (typeof window !== 'undefined') {
      window.history.replaceState(null, '', window.location.pathname);
    }
  }

  const nombre = data?.usuario?.nombre_completo ?? nombreProp;
  const avatarUrl = data?.usuario?.avatar_url ?? null;

  const vacantesDisponibles = getArrayLength(
    data?.orientacion?.vacantes_compatibles,
  );

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
            : ('media' as const),
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

  const promedioSemanal = data?.bienestar?.notaPromedio ?? 0;

  const skillsMatchFromUserSkills = (() => {
    const resumen = skillsData?.resumen;

    if (!resumen) {
      return undefined;
    }

    const total = resumen.adquiridas + resumen.faltantes + resumen.enProgreso;

    if (total === 0) {
      return undefined;
    }

    return clampPercent((resumen.adquiridas / total) * 100);
  })();

  const orientacionGapPorcentual =
    data?.orientacion?.gap_porcentual ??
    skillsData?.orientacion?.gap_porcentual ??
    null;

  const skillsMatchPorcentaje =
    orientacionGapPorcentual != null
      ? clampPercent(100 - Number(orientacionGapPorcentual))
      : skillsMatchFromUserSkills;

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

  const perfilCompletado = data?.perfil_completado ?? undefined;
  const perfilBreakdown = data?.perfil_breakdown;

  const hasCheckinToday = data?.bienestar?.hasCheckinToday ?? false;
  const todayCheckin = data?.bienestar?.todayCheckin ?? null;
  const aiRecommendationsStatus = getAiRecommendationsStatus(data);

  const dashboardHero = useMemo<DashboardHero>(() => {
    const firstName = getFirstName(nombre);
    const match = skillsMatchPorcentaje ?? data?.match_perfil ?? 0;
    const hasWellbeingAttention =
      todayCheckin?.nota_diaria != null && Number(todayCheckin.nota_diaria) < 4;

    const canShowJobs = match >= 50 && vacantesDisponibles > 0;
    const missingSkillsCount = Math.min(
      getArrayLength(data?.orientacion?.gap_items),
      3,
    );

    if (hasWellbeingAttention) {
      return {
        tone: 'wellbeing',
        titleKey: 'heroWellbeingTitle',
        descriptionKey: 'heroWellbeingDescription',
        values: { nombre: firstName },
        primaryLabelKey: 'heroCtaWellbeing',
        primaryHref: '/bienestar',
        secondaryLabelKey: 'heroCtaPlan',
        secondaryHref: '/formacion',
      };
    }

    if (canShowJobs) {
      return {
        tone: 'jobs',
        titleKey: 'heroJobsTitle',
        descriptionKey: 'heroJobsDescription',
        values: {
          nombre: firstName,
          vacantes: vacantesDisponibles,
        },
        primaryLabelKey: 'heroCtaJobs',
        primaryHref: '/empleabilidad',
        secondaryLabelKey: 'heroCtaContinueProgress',
        secondaryHref: '/formacion',
      };
    }

    if (match > 0) {
      return {
        tone: 'learning',
        titleKey: 'heroProgressTitle',
        descriptionKey: 'heroProgressDescription',
        values: {
          nombre: firstName,
          match,
        },
        primaryLabelKey: 'heroCtaLearning',
        primaryHref: '/formacion',
        secondaryLabelKey: 'heroCtaPlan',
        secondaryHref: '/formacion',
      };
    }

    return {
      tone: 'learning',
      titleKey: 'heroStartTitle',
      descriptionKey:
        missingSkillsCount > 0
          ? 'heroStartDescription'
          : 'heroStartNoSkillsDescription',
      values: {
        nombre: firstName,
        skills: missingSkillsCount,
      },
      primaryLabelKey: 'heroCtaLearning',
      primaryHref: '/formacion',
      secondaryLabelKey: 'heroCtaPlan',
      secondaryHref: '/formacion',
    };
  }, [
    data?.match_perfil,
    data?.orientacion?.gap_items,
    nombre,
    skillsMatchPorcentaje,
    todayCheckin?.nota_diaria,
    vacantesDisponibles,
  ]);

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

  const secondaryHeroAction =
    dashboardHero.secondaryLabelKey && dashboardHero.secondaryHref
      ? {
          label: t(dashboardHero.secondaryLabelKey),
          href: dashboardHero.secondaryHref,
        }
      : null;

  const heroValues = compactTranslationValues(dashboardHero.values);

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
          title={t(dashboardHero.titleKey, heroValues)}
          description={t(dashboardHero.descriptionKey, heroValues)}
          tone={dashboardHero.tone}
          isLoading={isInitialDashboardLoading}
          isRefreshing={isRefreshingDashboard}
          refreshingLabel={t('heroRefreshing')}
          primaryAction={{
            label: t(dashboardHero.primaryLabelKey),
            onClick: () => router.push(dashboardHero.primaryHref),
          }}
          secondaryAction={
            secondaryHeroAction
              ? {
                  label: secondaryHeroAction.label,
                  onClick: () => router.push(secondaryHeroAction.href),
                }
              : undefined
          }
        />

        <div className='grid min-w-0 grid-cols-1 gap-4 md:gap-5 xl:grid-cols-12'>
          <div className='xl:col-span-4'>
            <SkillsGapCard
              porcentaje={skillsMatchPorcentaje}
              puesto={skillsPuesto}
              isLoading={isInitialDashboardLoading}
              onVerDetalles={() => {
                setSkillsModalOpen(true);
                void loadSkills();
              }}
            />
          </div>

          <div className='xl:col-span-5'>
            {aiRecommendationsStatus === 'generating' ? (
              <PlanGeneratingCard
                title={t('planGeneratingTitle')}
                description={t('planGeneratingDescription')}
              />
            ) : (
              <ActionPlanCard
                items={actionItems}
                isLoading={isInitialDashboardLoading}
                onItemClick={handleActionPlanItemClick}
              />
            )}
          </div>

          <div className='xl:col-span-3'>
            <WellbeingCard
              promedioSemanal={promedioSemanal}
              isLoading={isInitialDashboardLoading}
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
        isLoading={isLoadingSkills}
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
        onSaved={() => {
          void loadDashboard({
            force: true,
          });
        }}
      />
    </AppShell>
  );
}
