export interface MentoriaData {
  user: {
    name?: string;
    avatarUrl?: string | null;
    profilePercent?: number;
    perfilBreakdown?: {
      onboarding: boolean;
      movilidad: boolean;
      avatar: boolean;
      ubicacion: boolean;
      whatsapp: boolean;
    };
  };
}
