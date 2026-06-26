import { z } from 'zod';

// --- UTILIDADES ---
const validText = (field: string) => z.string()
  .optional()
  .refine((val) => {
    if (!val || !val.trim()) return true; 
    if (val.trim().length < 3) return false;
    const letras = new Set(val.match(/[a-zA-ZáéíóúñÑ]/g) || []);
    return letras.size >= 2;
  }, { message: `El campo ${field} no es válido` });

// --- HU 9.3: BIENESTAR ---
export const wellbeingRequestSchema = z.object({
  userId: z.string(),
  emoji: z.enum(['Agotado', 'Triste', 'Neutral', 'Bien', 'Genial']),
  nota_diaria: z.number().min(0).max(10).optional(),
  motivo: validText('motivo'),
  contexto: validText('contexto'),
  historial_semanal: z.array(z.number()).optional(),
  idioma: z.string().default('Español')
});

// --- HU 9.1: EMPLEABILIDAD ---
export const jobMatchRequestSchema = z.object({
  userId: z.string(),
  userProfile: z.object({
    skills: z.array(z.string()),
    education: z.string(),
    englishLevel: z.string()
  }),
  jobVacancy: z.object({
    id: z.string(),
    title: z.string(),
    requiredSkills: z.array(z.string()),
    requiredEducation: z.string(),
    requiredEnglishLevel: z.string(),
    active: z.boolean().default(true)
  }),
  commuteScore: z.number().min(0).max(100)
});

// --- HU 9.2: APRENDIZAJE ---
export const learningPathRequestSchema = z.object({
  userId: z.string(),
  currentSkills: z.array(z.string()),
  targetJob: z.string(),
  gapItems: z.array(z.string()),
  courseCatalog: z.array(z.object({
    id: z.string(),
    title: z.string(),
    habilidad_principal: z.string(),
    activo: z.boolean(),
    es_gratis: z.boolean(),
    duracion_horas: z.number()
  }))
});