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
          titulo: z.string(),
        })
        .nullable(),
    }),
  ),
  bienestar: z.object({
    notaPromedio: z.number(),
    totalCheckins: z.number(),
  }),
  notificacionesNoLeidas: z.number(),
  perfilMovilidad: z
    .object({
      home_cluster: z.string().nullable(),
      income_cluster: z.string().nullable(),
      mobility_pattern: z.string().nullable(),
    })
    .nullable(),
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
  fechaNacimiento: z.string(),
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

// --- SCHEMAS PARA EMPLEABILIDAD (FE-004) ---
export const postulacionRequestSchema = z.object({
  vacante_id: z.string().uuid(),
  mensaje_motivacion: z.string().max(2000).optional(),
  usar_cv_guardado: z.boolean(),
});

export type PostulacionRequest = z.infer<typeof postulacionRequestSchema>;

export const vacanteSkillSchema = z.object({
  nombre: z.string(),
  laTienes: z.boolean(),
});

export type VacanteSkill = z.infer<typeof vacanteSkillSchema>;

export const vacanteItemSchema = z.object({
  id: z.string(),
  titulo: z.string(),
  empresa: z.string(),
  empresaDescripcion: z.string().nullable(),
  logoUrl: z.string().nullable(),
  area: z.string(),
  nivel: z.string(),
  modalidad: z.string(),
  modalidadDetallada: z.string().nullable(),
  ubicacion: z.string(),
  distancia: z.string().nullable(),
  matchPorcentaje: z.number(),
  fechaPublicacion: z.string(),
  descripcion: z.string().nullable(),
  educacionRequerida: z.array(z.string()),
  experienciaSolicitada: z.array(z.string()),
  idioma: z.array(z.string()),
  jornada: z.array(z.string()),
  skills: z.array(vacanteSkillSchema),
});

export type VacanteItem = z.infer<typeof vacanteItemSchema>;

export const vacantesResponseSchema = z.object({
  vacantes: z.array(vacanteItemSchema),
});

export type VacantesResponse = z.infer<typeof vacantesResponseSchema>;

export const postulacionItemSchema = z.object({
  id: z.string(),
  titulo: z.string(),
  empresa: z.string(),
  logoUrl: z.string().nullable(),
  estado: z.string(),
  matchPorcentaje: z.number().nullable(),
  feedback: z.string().nullable(),
  skillRechazada: z.string().nullable(),
  mensajesNuevos: z.number(),
  creadoEn: z.string(),
});

export type PostulacionItem = z.infer<typeof postulacionItemSchema>;

export const postulacionesResponseSchema = z.object({
  postulaciones: z.array(postulacionItemSchema),
});

export type PostulacionesResponse = z.infer<typeof postulacionesResponseSchema>;

export const postulacionCreateResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  postulacionId: z.string(),
});

export type PostulacionCreateResponse = z.infer<typeof postulacionCreateResponseSchema>;

export type OnboardingAIRequest = z.infer<typeof onboardingAIRequestSchema>;
export type OnboardingAIResponse = z.infer<typeof onboardingAIResponseSchema>;
