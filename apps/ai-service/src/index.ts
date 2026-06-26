/// <reference types="node" />
import 'dotenv/config';
import { Hono } from 'hono';
import { handle } from 'hono/vercel';
import { cors } from 'hono/cors';
import { GoogleGenerativeAI } from '@google/generative-ai';
import {
  wellbeingRequestSchema,
  jobMatchRequestSchema,
  learningPathRequestSchema
} from '@appbit/shared-schemas';
import { EMOJI_VALUES } from '@appbit/shared-types';

const app = new Hono();
app.use('*', cors());

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

// --- HU 9.3: BIENESTAR ---
app.post('/wellbeing/analyze', async (c) => {
  const body = await c.req.json();
  const validation = wellbeingRequestSchema.safeParse(body);
  if (!validation.success) return c.json(validation.error, 400);

  const { emoji, motivo, contexto, historial_semanal, idioma } = validation.data;

  const nota_actual = EMOJI_VALUES[emoji] ?? 5;
  const notas = historial_semanal?.length ? historial_semanal : [nota_actual];
  const nota_semanal = notas.reduce((a, b) => a + b, 0) / notas.length;

  const prompt = `Eres un asistente de bienestar emocional empático. El usuario se siente "${emoji}". Motivo: "${motivo ?? 'no especificado'}". Contexto: "${contexto ?? 'no especificado'}". Nota semanal promedio: ${nota_semanal.toFixed(1)}/10. Idioma: ${idioma}. Responde con un JSON: { "mensaje": string, "accion_sugerida": string, "emergencia": boolean }`;

  const result = await model.generateContent(prompt);
  const aiResponse = JSON.parse(result.response.text().replace(/\`\`\`json|\`\`\`/g, '').trim());

  return c.json({
    nota_actual,
    nota_semanal,
    mensaje: aiResponse.mensaje,
    accion_sugerida: aiResponse.accion_sugerida,
    derivar_cvv: aiResponse.emergencia || nota_semanal < 4,
    alerta: nota_semanal < 5.5
  });
});

// --- HU 9.1: MATCH EMPLEABILIDAD (85/15) ---
app.post('/job-match/calculate', async (c) => {
  const body = await c.req.json();
  const validation = jobMatchRequestSchema.safeParse(body);
  if (!validation.success) return c.json(validation.error, 400);

  const { userProfile, jobVacancy, commuteScore } = validation.data;

  const prompt = `Compara Perfil [${userProfile.skills}] vs Vacante [${jobVacancy.requiredSkills}]. Calcula technicalScore (0-100) y lista gaps. JSON: { "technicalScore": number, "gaps": string[], "summary": string }`;

  const result = await model.generateContent(prompt);
  const aiData = JSON.parse(result.response.text().replace(/\`\`\`json|\`\`\`/g, '').trim());

  const matchScore = Math.round((aiData.technicalScore * 0.85) + (commuteScore * 0.15));

  return c.json({ matchScore, technicalCompatibility: aiData.technicalScore, gaps: aiData.gaps, summary: aiData.summary });
});

// --- HU 9.2: RUTAS DE APRENDIZAJE ---
app.post('/learning-path/recommend', async (c) => {
  const body = await c.req.json();
  const validation = learningPathRequestSchema.safeParse(body);
  if (!validation.success) return c.json(validation.error, 400);

  const { currentSkills, targetJob, gapItems, courseCatalog } = validation.data;

  const activeCourses = courseCatalog.filter(course => course.activo);
  const prompt = `Usuario quiere ser "${targetJob}". Tiene: [${currentSkills}]. Le faltan: [${gapItems}]. Catálogo disponible: ${JSON.stringify(activeCourses.map(c => ({ id: c.id, title: c.title, skill: c.habilidad_principal, gratis: c.es_gratis, horas: c.duracion_horas })))}. Selecciona los 5 mejores cursos priorizando gratuitos y menor duración. JSON: { "recommendations": [{ "courseId": string, "title": string, "reason": string, "priority": number }], "summary": string }`;

  const result = await model.generateContent(prompt);
  const aiData = JSON.parse(result.response.text().replace(/\`\`\`json|\`\`\`/g, '').trim());

  return c.json({ recommendations: aiData.recommendations, summary: aiData.summary, totalGaps: gapItems.length });
});

// Health check
app.get('/health', (c) => c.json({ status: 'ok', service: 'AppBit AI Service' }));

export const GET = handle(app);
export const POST = handle(app);