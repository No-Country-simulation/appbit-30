export interface Vacante {
  vacante_id: string;
  titulo: string;
  area: string;
  nivel: string;
  descripcion: string | null;
  jornada: string | null;
  modalidad: string;
  pais: string;
  ciudad: string | null;
  detalle_modalidad: string | null;
  distancia_zona: string | null;
  idiomas_requeridos: unknown;
  fecha_publicacion: string;
  empresa: {
    empresa_id: string;
    nombre: string;
    logo_url: string | null;
    sector: string | null;
    tamanio: string | null;
  };
  requisitos: Array<{
    requisito_id: string;
    prioridad: number;
    habilidad: {
      habilidad_id: string;
      nombre: string;
      categoria: string | null;
    };
  }>;
  total_postulaciones: number;
  match_porcentaje: number | null;
}

export interface Postulacion {
  postulacion_id: string;
  estado: string;
  match_porcentaje: number | null;
  mensaje_motivacion: string | null;
  usar_cv_guardado: boolean;
  cv_url: string | null;
  creado_en: string;
  vacante: {
    vacante_id: string;
    titulo: string;
    area: string;
    nivel: string;
    modalidad: string;
    empresa: {
      nombre: string;
      logo_url: string | null;
    };
  };
}

export interface VacanteDetalle extends Omit<Vacante, 'total_postulaciones'> {
  educacion_requerida: string | null;
  experiencia_solicitada: string | null;
  empresa: {
    empresa_id: string;
    nombre: string;
    descripcion: string | null;
    logo_url: string | null;
    sector: string | null;
    tamanio: string | null;
  };
}
