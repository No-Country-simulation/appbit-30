import type { PerfilBreakdown } from '@/src/features/profile/profile-completion';

export type EmployabilityLocale = 'es' | 'pt';

export interface VacanteSkill {
  nombre: string;
  laTienes: boolean;
  progresoPorcentaje: number;
}

export type MobilityCategory =
  | 'remote'
  | 'compatible'
  | 'moderate'
  | 'distant'
  | 'unavailable';

export interface MobilityInsight {
  category: MobilityCategory;
  distanceKm: number | null;
  originCluster: string | null;
  destinationCluster: string | null;
  destinationMunicipality: string | null;
  source: 'modality' | 'florianopolis_dataset' | 'unavailable';
}

export interface VacanteItem {
  id: string;
  source: 'local' | 'b2b';
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
  movilidad: MobilityInsight;
  matchPorcentaje: number | null;
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
  | 'En_proceso'
  | 'Rechazada'
  | 'Aceptada';

export interface PostulacionItem {
  id: string;
  vacanteId: string;
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
