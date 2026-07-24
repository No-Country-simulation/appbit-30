import type { PerfilBreakdown } from '@/src/features/profile/profile-completion';

export interface ExperienciasData {
  user: {
    name?: string;
    avatarUrl?: string | null;
    profilePercent?: number;
    perfilBreakdown?: PerfilBreakdown;
  };
}
