import type { PerfilBreakdown } from '@/src/features/profile/profile-completion';

export type MoodTone = 'positive' | 'neutral' | 'negative' | 'empty';

export interface BienestarCalendarDay {
  key: string;
  day: number | null;
  emoji?: string;
  tone: MoodTone;
}

export interface BienestarBreakdown {
  positivePercent: number;
  neutralPercent: number;
  negativePercent: number;
}

export interface BienestarData {
  user: {
    name?: string;
    avatarUrl?: string | null;
    profilePercent?: number;
    perfilBreakdown?: PerfilBreakdown;
  };
  latestResponse: {
    mensaje: string;
    accionSugerida: string;
    derivarCvv: boolean;
    alerta: boolean;
    creadoEn: string;
  } | null;
  weeklyAverage: number | null;
  monthlyBreakdown: BienestarBreakdown;
  calendar: {
    monthLabel: string;
    weekDays: string[];
    days: BienestarCalendarDay[];
  };
  offlineAlert: {
    mensaje: string;
  } | null;
  shouldShowUrgentHelp: boolean;
}
