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

// --- SCHEMAS PARA ONBOARDING (FE-002) ---
export const onboardingSchema = z.object({
  userId: z.string(),
  // Step 1 - Datos personales
  fechaNacimiento: z.string().min(1, 'Fecha de nacimiento es requerida'),
  genero: z.enum(['Masculino', 'Femenino', 'No_binario', 'Prefiero_no_decir']),
  pais: z.string().min(2, 'País es requerido'),
  provinciaEstado: z.string().optional(),
  ciudad: z.string().min(2, 'Ciudad es requerida'),
  zonaResidencia: z.string().optional(),
  // Step 2 - Perfil profesional
  nivelEducacion: z.array(z.string()).min(1, 'Selecciona al menos un nivel'),
  momentoProfesional: z.string().min(1, 'Selecciona tu momento profesional'),
  areasInteres: z.array(z.string()).min(1, 'Selecciona al menos un área de interés'),
  idiomas: z.array(z.string()).min(1, 'Selecciona al menos un idioma'),
  disponibilidad: z.string().min(1, 'Selecciona tu disponibilidad'),
  ubicacionTrabajo: z.string().min(1, 'Selecciona tu ubicación de trabajo'),
  // Step 3 - Objetivos y contexto
  objetivos: z.array(z.string()).min(1, 'Selecciona al menos un objetivo'),
  dispositivos: z.array(z.string()).min(1, 'Selecciona al menos un dispositivo'),
  tipoConexion: z.string().min(1, 'Selecciona tu tipo de conexión'),
  whatsappCodigo: z.string().optional(),
  whatsappNumero: z.string().optional(),
});

export type OnboardingRequest = z.infer<typeof onboardingSchema>;

export const onboardingResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  userId: z.string(),
});