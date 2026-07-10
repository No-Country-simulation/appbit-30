export const areaLabels: Record<string, string> = {
  Data_Analytics: 'Data Analytics',
  Desarrollo_Web: 'Desarrollo Web',
  UX_UI_Design: 'UX/UI Design',
  Ciberseguridad: 'Ciberseguridad',
  Cloud_DevOps: 'Cloud DevOps',
  Inteligencia_Artificial: 'Inteligencia Artificial',
  Marketing_Digital: 'Marketing Digital',
  Product_Management: 'Product Management',
};

export const nivelLabels: Record<string, string> = {
  Jr_Entry_Level: 'Jr. / Entry Level',
  Semi_Senior: 'Semi Senior',
  Senior: 'Senior',
};

export const modalidadLabels: Record<string, string> = {
  Presencial: 'Presencial',
  Hibrido: 'Híbrido',
  Remoto: '100% Remoto',
};

export const jornadaLabels: Record<string, string> = {
  Jornada_completa: 'Jornada completa',
  Media_jornada: 'Media jornada',
  Relacion_dependencia: 'Relación de dependencia',
  Freelance: 'Freelance',
};

export const estadoLabels: Record<string, string> = {
  Enviada: 'Enviada',
  Vista: 'Vista',
  En_proceso: 'En revisión',
  Rechazada: 'Rechazada',
  Aceptada: 'Aceptada',
  Cerrado: 'Proceso cerrado',
};

export function getLabel(
  labels: Record<string, string>,
  key: string,
  fallback: string,
): string {
  return labels[key] ?? fallback;
}