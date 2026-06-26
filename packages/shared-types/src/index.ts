import type { WellbeingEmoji } from './wellbeing.js';

export * from './wellbeing.js';

export interface WellbeingRequest {
  userId: string;
  emoji: WellbeingEmoji;
  nota_diaria?: number;
  motivo?: string;
  contexto?: string;
  historial_semanal?: number[];
  idioma?: string;
}

export interface WellbeingResponse {
  nota_actual: number;
  nota_semanal: number;
  mensaje: string;
  accion_sugerida: string;
  derivar_cvv: boolean;
  alerta: boolean;
}

export interface OrientationRequest {
  userId: string;
  level: string;
  goal: string;
}
