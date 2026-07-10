export interface PerfilBreakdown {
  onboarding: boolean;
  movilidad: boolean;
  avatar: boolean;
  ubicacion: boolean;
  whatsapp: boolean;
}

export interface VacanteSkill {
  nombre: string;
  laTienes: boolean;
}

export interface VacanteItem {
  id: string;
  titulo: string;
  empresa: string;
  empresaDescripcion: string | null;
  logoUrl: string | null;
  area: string;
  nivel: string;
  modalidad: string;
  modalidadDetallada: string | null;
  ubicacion: string;
  distancia: string | null;
  matchPorcentaje: number;
  fechaPublicacion: string;
  descripcion: string | null;
  educacionRequerida: string[];
  experienciaSolicitada: string[];
  idioma: string[];
  jornada: string[];
  skills: VacanteSkill[];
}

export type PostulacionEstado =
  | 'Enviada'
  | 'Vista'
  | 'En_revision'
  | 'Rechazada'
  | 'Aceptada'
  | 'Cerrado';

export interface PostulacionItem {
  id: string;
  titulo: string;
  empresa: string;
  logoUrl: string | null;
  estado: PostulacionEstado;
  matchPorcentaje: number | null;
  feedback: string | null;
  skillRechazada: string | null;
  mensajesNuevos: number;
  creadoEn: string;
}

export interface EmployabilityData {
  user: {
    name?: string;
    avatarUrl?: string | null;
    profilePercent?: number;
    perfilBreakdown?: PerfilBreakdown;
  };
  vacantes: VacanteItem[];
  postulaciones: PostulacionItem[];
}
