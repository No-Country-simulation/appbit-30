import { z } from 'zod';

export const orientationSchema = z.object({
  userId: z.string(),
  level: z.string(),
  goal: z.string(),
});

// Validación de texto según especificación del documento de salud
const validText = (field: string) => z.string()
  .optional()
  .refine((val) => {
    if (!val || !val.trim()) return true; // vacío es válido
    if (val.trim().length < 3) return false;
    const letras = new Set(val.match(/[a-zA-ZáéíóúñÑ]/g) || []);
    if (letras.size < 2) return false;
    if (!/[a-zA-ZáéíóúñÑ]/.test(val)) return false;
    return true;
  }, { message: `El campo ${field} no es válido` });

// --- SCHEMAS PARA BIENESTAR (HU 9.3) ---
export const wellbeingRequestSchema = z.object({
  userId: z.string(),
  emoji: z.enum(['Agotado', 'Triste', 'Neutral', 'Bien', 'Genial']),
  nota_diaria: z.number().min(0).max(10).optional(), // Si no viene, se infiere del emoji
  motivo: validText('motivo'),
  contexto: validText('contexto'),
  historial_semanal: z.array(z.number().min(0).max(10)).optional(),
  idioma: z.string().default('Español')
});

export const wellbeingResponseSchema = z.object({
  nota_actual: z.number(),
  nota_semanal: z.number(),
  mensaje: z.string(),
  accion_sugerida: z.string(),
  derivar_cvv: z.boolean(),
  alerta: z.boolean()
});