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

function isValidBirthDate(value: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);

  if (!match) return false;

  const [, yearRaw, monthRaw, dayRaw] = match;

  const year = Number(yearRaw);
  const month = Number(monthRaw);
  const day = Number(dayRaw);

  if (year < 1900) return false;
  if (month < 1 || month > 12) return false;
  if (day < 1 || day > 31) return false;

  const date = new Date(Date.UTC(year, month - 1, day));

  const isRealDate =
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day;

  if (!isRealDate) return false;

  const today = new Date();
  const todayUtc = Date.UTC(
    today.getUTCFullYear(),
    today.getUTCMonth(),
    today.getUTCDate(),
  );

  const dateUtc = Date.UTC(year, month - 1, day);

  return dateUtc <= todayUtc;
}

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

export type WellbeingRequest = z.infer<typeof wellbeingRequestSchema>;

export const EMOJIS_CHECKIN = [
  'agotado',
  'triste',
  'neutral',
  'bien',
  'genial',
] as const;

export const checkinRequestSchema = z.object({
  emoji: z.enum(EMOJIS_CHECKIN, {
    error: 'El estado emocional seleccionado no es válido.',
  }),
  motivos: z
    .array(z.string().trim().min(1, 'El motivo no puede estar vacío'))
    .max(10, 'Se permiten como máximo 10 motivos.'),
  contexto: z
    .string()
    .trim()
    .max(500, 'El contexto no puede superar los 500 caracteres.')
    .optional(),
  timezone: z.string().trim().min(1).max(100).optional(),
});

export type CheckinRequest = z.infer<typeof checkinRequestSchema>;
// --- SCHEMAS PARA ONBOARDING (FE-002) ---
export const onboardingStep1Schema = z
  .object({
    fechaNacimiento: z.string().refine(isValidBirthDate, {
      message: 'Fecha de nacimiento inválida',
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
    zonaResidencia: z.string().max(100).optional(),
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
          nivel: z.enum([
            'A1',
            'A2',
            'B1',
            'B2',
            'C1',
            'C2',
            'Nativo',
          ] as const),
        }),
      )
      .min(1, { message: 'Seleccioná al menos un idioma' }),
    disponibilidad: z
      .array(
        z.enum(['Part_time', 'Full_time', 'Contractor', 'Freelance'] as const),
      )
      .min(1, { message: 'Seleccioná al menos una disponibilidad' }),
    ubicacionTrabajo: z
      .array(z.enum(['Presencial', 'Hibrido', 'Remoto'] as const))
      .min(1, { message: 'Seleccioná al menos una modalidad' }),
  })
  .strip();

export const onboardingStep3Schema = z
  .object({
    nivelExperienciaTecnologia: z.enum([
      'Desde_cero',
      'Con_conocimientos_previos',
    ] as const),
    habilidadesTecnicas: z.array(z.string().trim().min(1)).default([]),
    habilidadesBlandas: z.array(z.string().trim().min(1)).default([]),
  })
  .strip();

export const onboardingStep4Schema = z
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
    tipoConexion: z
      .array(
        z.enum([
          'Banda_ancha_estable',
          'Datos_moviles',
          'Conexion_inestable',
          'Sin_conexion_casa',
        ] as const),
      )
      .min(1, { message: 'Seleccioná al menos un tipo de conexión' }),
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

const PHONE_LENGTH_MAP: Record<string, number> = {
  '+54': 10,
  '+55': 11,
  '+56': 9,
  '+57': 10,
  '+52': 10,
  '+51': 9,
  '+598': 8,
  '+595': 9,
  '+591': 8,
  '+593': 9,
  '+58': 10,
  '+53': 8,
  '+1': 10,
  '+502': 8,
  '+504': 8,
  '+503': 8,
  '+505': 8,
  '+506': 8,
  '+507': 8,
  '+34': 9,
  '+44': 10,
  '+351': 9,
};

export const onboardingSchema = z
  .object({
    ...onboardingStep1Schema.shape,
    ...onboardingStep2Schema.shape,
    ...onboardingStep3Schema.shape,
    ...onboardingStep4Schema.shape,
  })
  .superRefine((data, ctx) => {
    if (
      (data.whatsappCodigo && !data.whatsappNumero) ||
      (!data.whatsappCodigo && data.whatsappNumero)
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['whatsappNumero'],
        message: 'whatsappCodigo y whatsappNumero deben completarse juntos',
      });
    }

    if (data.whatsappCodigo && data.whatsappNumero) {
      const expectedLen = PHONE_LENGTH_MAP[data.whatsappCodigo];
      if (expectedLen && data.whatsappNumero.length !== expectedLen) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `El número debe tener ${expectedLen} dígitos para ${data.whatsappCodigo}`,
          path: ['whatsappNumero'],
        });
      }
    }

    if (data.nivelExperienciaTecnologia === 'Con_conocimientos_previos') {
      if (data.habilidadesTecnicas.length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['habilidadesTecnicas'],
          message: 'Seleccioná al menos una habilidad técnica',
        });
      }

      if (data.habilidadesBlandas.length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['habilidadesBlandas'],
          message: 'Seleccioná al menos una habilidad blanda',
        });
      }
    }
  });

export type OnboardingRequest = z.infer<typeof onboardingSchema>;

export const onboardingResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  userId: z.string(),
});

// --- SCHEMAS PARA DASHBOARD (FE-003) ---
export const dashboardResponseSchema = z.object({
  perfil_completado: z.number(),
  match_perfil: z.number(),
  perfil_breakdown: z.object({
    onboarding: z.boolean(),
    movilidad: z.boolean(),
    avatar: z.boolean(),
    ubicacion: z.boolean(),
    whatsapp: z.boolean(),
  }),
  usuario: z.object({
    nombre_completo: z.string(),
    avatar_url: z.string().nullable(),
    confianza: z.number().nullable(),
    home_cluster: z.string().nullable(),
  }),
  areasInteres: z.array(z.string()).optional(),
  orientacion: z
    .object({
      gap_porcentual: z.number(),
      vacantes_compatibles: z.array(z.any()),
      gap_items: z.array(z.any()),
      trayectoria_sugerida: z.array(z.any()),
    })
    .nullable(),
  planAccion: z.array(
    z.object({
      plan_item_id: z.string(),
      titulo: z.string(),
      prioridad: z.string(),
      completado: z.boolean(),
      orden: z.number(),
      accion_label: z.string().nullable(),
      curso: z
        .object({
          curso_id: z.string().nullable().optional(),
          titulo: z.string().nullable().optional(),
          url_externa: z.string().nullable().optional(),
          plataforma: z.string().nullable().optional(),
          tipo: z.string().nullable().optional(),
          hasInternalContent: z.boolean().nullable().optional(),
        })
        .nullable()
        .optional(),
    }),
  ),
  bienestar: z.object({
    notaPromedio: z.number(),
    totalCheckins: z.number(),
    hasCheckinToday: z.boolean(),
    todayCheckin: z
      .object({
        checkin_id: z.string(),
        emoji: z.string(),
        nota_diaria: z.number(),
        creado_en: z.string(),
      })
      .nullable(),
  }),
  notificacionesNoLeidas: z.number(),
  perfilMovilidad: z
    .object({
      home_cluster: z.string().nullable(),
      income_cluster: z.string().nullable(),
      mobility_pattern: z.string().nullable(),
    })
    .nullable(),
  success: z.boolean().optional(),
  requestId: z.string().optional(),
  degradedSections: z.array(z.string()).optional(),
});

export type DashboardResponse = z.infer<typeof dashboardResponseSchema>;

// --- SCHEMAS PARA SKILLS (FE-003) ---
export const skillsResponseSchema = z.object({
  habilidades: z.array(
    z.object({
      habilidad_id: z.string(),
      nombre: z.string(),
      categoria: z.string().nullable(),
      area_principal: z.string().nullable(),
      estado: z.string(),
    }),
  ),
  gaps: z.array(z.any()),
  mercadoHabilidades: z.array(
    z.object({
      habilidad_id: z.string(),
      nombre: z.string(),
      categoria: z.string().nullable(),
      area_principal: z.string().nullable(),
    }),
  ),
  resumen: z.object({
    adquiridas: z.number(),
    faltantes: z.number(),
    enProgreso: z.number(),
    totalMercado: z.number(),
  }),
  orientacion: z
    .object({
      gap_porcentual: z.number(),
      trayectoria_sugerida: z.array(z.any()),
    })
    .nullable(),
});

export type SkillsResponse = z.infer<typeof skillsResponseSchema>;

// --- SCHEMAS PARA ONBOARDING AI (FE-002 / FE-003) ---
export const onboardingAIRequestSchema = z.object({
  usuarioId: z.string(),
  fechaNacimiento: z.string().refine(isValidBirthDate, {
    message: 'Fecha de nacimiento inválida',
  }),
  genero: z.string(),
  pais: z.string(),
  provinciaEstado: z.string().optional(),
  ciudad: z.string(),
  zonaResidencia: z.string().optional(),
  nivelEducacion: z.array(z.string()),
  momentoProfesional: z.array(z.string()),
  areasInteres: z.array(z.string()),
  idiomas: z.array(
    z.object({
      idioma: z.string(),
      nivel: z.string(),
    }),
  ),
  disponibilidad: z.array(z.string()),
  ubicacionTrabajo: z.array(z.string()),
  nivelExperienciaTecnologia: z.enum([
    'Desde_cero',
    'Con_conocimientos_previos',
  ] as const),
  habilidadesTecnicas: z.array(z.string()).default([]),
  habilidadesBlandas: z.array(z.string()).default([]),
  objetivos: z.array(z.string()),
  dispositivos: z.array(z.string()),
  tipoConexion: z
    .array(
      z.enum([
        'Banda_ancha_estable',
        'Datos_moviles',
        'Conexion_inestable',
        'Sin_conexion_casa',
      ] as const),
    )
    .min(1),
  locale: z.string().optional(),
  nivel_inicial: z
    .enum(['sin_conocimiento', 'con_conocimientos_previos'] as const)
    .optional(),
  gap_inicial: z.number().nullable().optional(),
});

export const onboardingAIResponseSchema = z.object({
  success: z.boolean(),
  usuarioId: z.string(),
  orientacionId: z.string().optional(),
  planAccionCount: z.number().optional(),
  habilidadesCount: z.number().optional(),
});

export type OnboardingAIRequest = z.infer<typeof onboardingAIRequestSchema>;
export type OnboardingAIResponse = z.infer<typeof onboardingAIResponseSchema>;

// --- SCHEMAS PARA EMPLEABILIDAD ---
export const createPostulacionSchema = z.object({
  vacante_id: z.uuid(),
  mensaje_motivacion: z
    .string()
    .trim()
    .max(2000)
    .optional()
    .transform((value) => value || undefined),
  usar_cv_guardado: z.boolean(),
});

export type CreatePostulacionRequest = z.infer<
  typeof createPostulacionSchema
>;
