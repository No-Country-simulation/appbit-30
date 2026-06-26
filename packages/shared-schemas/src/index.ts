import { z } from 'zod';
import {
  EMOJI_VALUES,
  type WellbeingEmoji,
} from '@appbit/shared-types/wellbeing';

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
  WellbeingEmoji,
  ...WellbeingEmoji[],
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
  alerta: z.boolean(),
});

// --- SCHEMAS PARA ONBOARDING (FE-002) ---
export const onboardingStep1Schema = z
  .object({
    fechaNacimiento: z
      .string()
      .refine((val) => !isNaN(Date.parse(val)), {
        message: 'Fecha inválida (ISO 8601)',
      })
      .refine((val) => new Date(val) < new Date(), {
        message: 'La fecha debe ser pasada',
      }),
    genero: z.enum([
      'Masculino',
      'Femenino',
      'No_binario',
      'Prefiero_no_decir',
    ] as const),
    pais: z.string().min(2).max(100),
    provinciaEstado: z.string().min(2).max(100).optional(),
    ciudad: z.string().min(2).max(100),
    zonaResidencia: z.string().min(2).max(100).optional(),
  })
  .strip();

export const onboardingStep2Schema = z
  .object({
    nivelEducacion: z
      .array(
        z.enum([
          'Secundario_incompleto',
          'Secundario_completo',
          'Universitario_incompleto',
          'Universitario_completo',
          'Licenciatura',
          'Diplomatura',
          'Maestria',
          'Doctorado',
        ] as const),
      )
      .min(1, { message: 'Seleccioná al menos un nivel educativo' }),
    momentoProfesional: z
      .array(
        z.enum([
          'Estudio_actualmente',
          'Sin_experiencia_laboral',
          'En_busqueda_activa',
          'Trabajando_cambiar',
          'Freelancer',
          'Emprendedor_a',
        ] as const),
      )
      .min(1, { message: 'Seleccioná al menos un momento profesional' }),
    areasInteres: z
      .array(
        z.enum([
          'Data_Analytics',
          'Desarrollo_Web',
          'UX_UI_Design',
          'Ciberseguridad',
          'Cloud_DevOps',
          'Inteligencia_Artificial',
          'Marketing_Digital',
          'Product_Management',
        ] as const),
      )
      .min(1, { message: 'Seleccioná al menos un área de interés' }),
    idiomas: z
      .array(
        z.object({
          idioma: z.enum([
            'Espanol',
            'Ingles',
            'Portugues',
            'Frances',
          ] as const),
          nivel: z.enum(['A1', 'A2', 'B1', 'B2', 'C1'] as const),
        }),
      )
      .min(1, { message: 'Seleccioná al menos un idioma' }),
    disponibilidad: z
      .array(
        z.enum(['Part_time', 'Full_time', 'Contractor', 'Freelance'] as const),
      )
      .min(1, { message: 'Seleccioná al menos una disponibilidad' }),
    ubicacionTrabajo: z.enum(['Presencial', 'Hibrido', 'Remoto'] as const),
  })
  .strip();

export const onboardingStep3Schema = z
  .object({
    objetivos: z
      .array(
        z.enum([
          'Primer_empleo_IT',
          'Reconversion_laboral',
          'Mejorar_salario',
          'Definir_camino',
          'Ampliar_red',
          'Aprender_tecnologias',
          'Estudiar_sin_trabajar',
          'Emprender',
        ] as const),
      )
      .min(1, { message: 'Seleccioná al menos un objetivo' }),
    dispositivos: z
      .array(z.enum(['Solo_celular', 'PC_Laptop', 'Tablet'] as const))
      .min(1, { message: 'Seleccioná al menos un dispositivo' }),
    tipoConexion: z.enum([
      'Banda_ancha_estable',
      'Datos_moviles',
      'Conexion_inestable',
      'Sin_conexion_casa',
    ] as const),
    whatsappCodigo: z
      .string()
      .regex(/^\+\d{1,4}$/, 'Código de país inválido (ej: +54)')
      .optional(),
    whatsappNumero: z
      .string()
      .regex(/^\d{7,15}$/, 'Número inválido (solo dígitos)')
      .optional(),
  })
  .strip();

export const onboardingSchema = z
  .object({
    ...onboardingStep1Schema.shape,
    ...onboardingStep2Schema.shape,
    ...onboardingStep3Schema.shape,
  })
  .refine(
    (data) => {
      if (
        (data.whatsappCodigo && !data.whatsappNumero) ||
        (!data.whatsappCodigo && data.whatsappNumero)
      )
        return false;
      return true;
    },
    { message: 'whatsappCodigo y whatsappNumero deben completarse juntos' },
  );

export type OnboardingRequest = z.infer<typeof onboardingSchema>;

export const onboardingResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  userId: z.string(),
});
