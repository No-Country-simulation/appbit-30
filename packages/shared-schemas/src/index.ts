import { z } from 'zod';
import { EMOJI_VALUES } from '../../shared-types/src/wellbeing';

export const orientationSchema = z.object({
  userId: z.string(),
  level: z.string(),
  goal: z.string(),
});

// Validación de texto según especificación del documento de salud
export const validText = (field: string) =>
  z
    .string()
    .optional()
    .refine(
      (val) => {
        if (!val || !val.trim()) return true; // vacío es válido
        if (val.trim().length < 3) return false;
        const letras = new Set(val.match(/[a-zA-ZáéíóúñÑ]/g) || []);
        if (letras.size < 2) return false;
        if (!/[a-zA-ZáéíóúñÑ]/.test(val)) return false;
        return true;
      },
      { message: `El campo ${field} no es válido` },
    );

const emojiKeys = Object.keys(EMOJI_VALUES) as [
  keyof typeof EMOJI_VALUES,
  ...(keyof typeof EMOJI_VALUES)[],
];

export const wellbeingEmojiSchema = z.enum(emojiKeys);

// --- SCHEMAS PARA BIENESTAR (HU 9.3) ---
export const wellbeingRequestSchema = z.object({
  userId: z.string(),
  emoji: wellbeingEmojiSchema,
  nota_diaria: z.number().min(0).max(10).optional(), // Si no viene, se infiere del emoji
  motivo: validText('motivo'),
  contexto: validText('contexto'),
  historial_semanal: z.array(z.number().min(0).max(10)).optional(),
  idioma: z.string().default('Español'),
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
export const onboardingStep1Schema = z.object({
  fechaNacimiento: z.string()
    .refine(val => !isNaN(Date.parse(val)), { message: 'Fecha inválida (ISO 8601)' })
    .refine(val => new Date(val) < new Date(), { message: 'La fecha debe ser pasada' }),
  genero: z.enum(['Masculino', 'Femenino', 'No_binario', 'Prefiero_no_decir'] as const),
  pais: z.string().min(2).max(100),
  provinciaEstado: z.string().min(2).max(100).optional(),
  ciudad: z.string().min(2).max(100),
  zonaResidencia: z.string().min(2).max(100).optional(),
}).strip();

export const onboardingStep2Schema = z.object({
  nivelEducacion: z.array(
    z.enum(['Secundario', 'Terciario', 'Universitario', 'Posgrado', 'Curso_técnico_Bootcamp', 'Otro'] as const)
  ).min(1, { message: 'Seleccioná al menos un nivel educativo' }),
  momentoProfesional: z.enum(
    ['Estudiando', 'Buscando_trabajo', 'Trabajando_menos_1año', 'Trabajando_mas_1año', 'Transicion_carrera', 'Desempleado'] as const
  ),
  areasInteres: z.array(
    z.enum(['Desarrollo_software', 'Datos_analisis', 'Diseno_UX_UI', 'Marketing_digital', 'Ciberseguridad', 'Cloud_infraestructura', 'Inteligencia_artificial', 'Gestion_proyectos', 'Soporte_tecnico', 'Otro'] as const)
  ).min(1, { message: 'Seleccioná al menos un área de interés' }),
  idiomas: z.array(
    z.object({
      idioma: z.enum(['Espanol', 'Ingles', 'Portugues', 'Frances'] as const),
      nivel: z.enum(['A1', 'A2', 'B1', 'B2', 'C1'] as const),
    })
  ).min(1, { message: 'Seleccioná al menos un idioma' }),
  disponibilidad: z.enum(['Inmediata', 'Un_mes', 'Tres_meses', 'Mas_de_tres_meses'] as const),
  ubicacionTrabajo: z.enum(['Remoto', 'Hibrido', 'Presencial'] as const),
}).strip();

export const onboardingStep3Schema = z.object({
  objetivos: z.array(
    z.enum(['Primer_empleo_tech', 'Cambio_area', 'Mejorar_puesto_actual', 'Emprendimiento', 'Nueva_habilidad', 'Certificacion'] as const)
  ).min(1, { message: 'Seleccioná al menos un objetivo' }),
  dispositivos: z.array(
    z.enum(['Android', 'iPhone', 'PC_Notebook', 'Tablet', 'Solo_celular'] as const)
  ).min(1, { message: 'Seleccioná al menos un dispositivo' }),
  tipoConexion: z.enum(['WiFi_casa', 'Datos_4G', 'Datos_5G', 'WiFi_compartido'] as const),
  whatsappCodigo: z.string().regex(/^\+\d{1,4}$/, 'Código de país inválido (ej: +54)').optional(),
  whatsappNumero: z.string().regex(/^\d{7,15}$/, 'Número inválido (solo dígitos)').optional(),
}).strip();

export const onboardingSchema = z.object({
  ...onboardingStep1Schema.shape,
  ...onboardingStep2Schema.shape,
  ...onboardingStep3Schema.shape,
}).refine(data => {
  if ((data.whatsappCodigo && !data.whatsappNumero) || (!data.whatsappCodigo && data.whatsappNumero))
    return false;
  return true;
}, { message: 'whatsappCodigo y whatsappNumero deben completarse juntos' });

export type OnboardingRequest = z.infer<typeof onboardingSchema>;

export const onboardingResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  userId: z.string(),
});
