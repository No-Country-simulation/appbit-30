export const PROFILE_COMPLETION_RULES = [
  {
    key: 'onboarding',
    points: 60,
  },
  {
    key: 'avatar',
    points: 20,
  },
  {
    key: 'ubicacion',
    points: 20,
  },
] as const;

export type PerfilBreakdownKey =
  (typeof PROFILE_COMPLETION_RULES)[number]['key'];

export type PerfilBreakdown = Record<PerfilBreakdownKey, boolean>;

export type ProfileCompletionInput = {
  onboarding_status?: string | null;
  avatar_url?: string | null;
  pais?: string | null;
  ciudad?: string | null;
};

function hasValue(value: string | null | undefined) {
  return Boolean(value?.trim());
}

export function buildProfileCompletion(user: ProfileCompletionInput) {
  const perfilBreakdown: PerfilBreakdown = {
    onboarding: user.onboarding_status === 'COMPLETED',
    avatar: hasValue(user.avatar_url),
    ubicacion: hasValue(user.pais) && hasValue(user.ciudad),
  };

  const profilePercent = PROFILE_COMPLETION_RULES.reduce((total, rule) => {
    return perfilBreakdown[rule.key] ? total + rule.points : total;
  }, 0);

  return {
    profilePercent,
    perfilBreakdown,
  };
}
