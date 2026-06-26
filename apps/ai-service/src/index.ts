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

const EMOJI_VALUES: Record<string, number> = {
  Agotado: 2,
  Triste: 3.5,
  Neutral: 5.5,
  Bien: 7.5,
  Genial: 9,
};

const app = new Hono();
app.use('*', cors());

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

app.get('/', (c) => c.text('AppBit AI Service - Operational'));
app.get('/health', (c) => c.json({ status: 'up' }));

// --- HU 9.3: BIENESTAR EMOCIONAL ---
app.post('/wellbeing/analyze', async (c) => {
  const body = await c.req.json();
  const validation = wellbeingRequestSchema.safeParse(body);
  if (!validation.success) return c.json(validation.error, 400);

  const { emoji, nota_diaria, motivo, contexto, historial_semanal = [], idioma } = validation.data;
  const nota_actual = nota_diaria ?? EMOJI_VALUES[emoji] ?? 0;
  const totalNotas = [...historial_semanal, nota_actual];
  const nota_semanal = Number((totalNotas.reduce((a, b) => (a ?? 0) + (b ?? 0), 0) / totalNotas.length).toFixed(2));
  
  const prompt = `Analiza check-in emocional: ${emoji}, Motivo: ${motivo}. Responde JSON: { "emergencia": boolean, "mensaje": string, "accion_sugerida": string }`;
  const result = await model.generateContent(prompt);
  const aiResponse = JSON.parse(result.response.text().replace(/```json|```/g, "").trim());

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
  
  const prompt = `Compara Perfil [${userProfile.skills}] vs Vacante [${jobVacancy.requiredSkills}]. 
  Calcula technicalScore (0-100) y lista gaps. JSON: { "technicalScore": number, "gaps": string[], "summary": string }`;
  
  const result = await model.generateContent(prompt);
  const aiData = JSON.parse(result.response.text().replace(/```json|```/g, "").trim());

  const matchScore = Math.round((aiData.technicalScore * 0.85) + (commuteScore * 0.15));

  return c.json({ matchScore, technicalCompatibility: aiData.technicalScore, gaps: aiData.gaps, summary: aiData.summary });
});

// --- HU 9.2: RUTAS DE APRENDIZAJE ---
app.post('/learning-path/recommend', async (c) => {
  const body = await c.req.json();
  const validation = learningPathRequestSchema.safeParse(body);
  if (!validation.success) return c.json(validation.error, 400);

  const { gapItems, courseCatalog } = validation.data;
  
  const prompt = `De este catálogo: ${JSON.stringify(courseCatalog)}, elige los 5 mejores para cubrir estos gaps: ${gapItems.join(", ")}. 
  Prioriza GRATIS y MENOR DURACIÓN. JSON: { "recommendations": [{ "courseId": string, "title": string, "reason": string }] }`;

  const result = await model.generateContent(prompt);
  const aiResponse = JSON.parse(result.response.text().replace(/```json|```/g, "").trim());

  return c.json({ gaps: gapItems, recommendations: aiResponse.recommendations });
});

// EXPORTS PARA VERCEL
export const GET = handle(app);
export const POST = handle(app);
export const OPTIONS = handle(app);