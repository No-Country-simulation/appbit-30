export interface FormacionDownloadItem {
  titulo: string;
  tamanioMb: number;
  tipo: string;
  url: string;
}

export interface FormacionCourseCard {
  id: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  area: string;
  areaLabel: string;
  type: 'Gratuito' | 'Pago';
  platform: string | null;
  externalUrl: string | null;
  durationDays: number | null;
  skillName: string | null;
  progress: number;
  planTitle?: string | null;
  actionLabel?: string | null;
  priority?: string | null;
  hasInternalContent: boolean;
}

export interface FormacionData {
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
  rutaLabel: string;
  showInclusionBanner: boolean;
  currentCourse: FormacionCourseCard | null;
  recommendedCourses: FormacionCourseCard[];
  paidCourses: FormacionCourseCard[];
  offlineItems: FormacionDownloadItem[];
  streakDays: number;
}

export type LessonStatus =
  | 'completada'
  | 'en_progreso'
  | 'proxima'
  | 'bloqueada';

export interface ModulePlayerLesson {
  numero: number;
  titulo: string;
  duracion: string;
  estado: LessonStatus;
  videoUrl?: string | null;
}

export interface ModulePlayerModule {
  titulo: string;
  completado: boolean;
  enProgreso: boolean;
  leccionesCompletadas: number;
  totalLecciones: number;
}

export interface ModulePlayerData {
  user: {
    name?: string;
    avatarUrl?: string | null;
  };
  courseId: string;
  moduleTitulo: string;
  cursoTitulo: string;
  ruta: string;
  progreso: number;
  leccionActual: string;
  duracionActual: string;
  duracionTotal: string;
  progresoLeccion: number;
  videoUrl?: string | null;
  externalUrl?: string | null;
  lecciones: ModulePlayerLesson[];
  modulos: ModulePlayerModule[];
  racha: number;
  certificado: string;
  puntos: number;
  desbloquea: string;
}
