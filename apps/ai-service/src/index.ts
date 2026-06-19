/// <reference types="node" />
import 'dotenv/config'; // Esto carga tu archivo .env
import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { wellbeingRequestSchema } from '@appbit/shared-schemas';

const app = new Hono();

app.use('*', cors());

app.get('/', (c) => c.text('AppBit AI Service - Operational'));

app.post('/wellbeing/analyze', async (c) => {
  try {
    const body = await c.req.json();
    
    const validation = wellbeingRequestSchema.safeParse(body);
    if (!validation.success) {
      return c.json({ error: 'Invalid input', details: validation.error }, 400);
    }

    const { emojiScore, text, weeklyNote } = validation.data;

    // REGLA ALGORÍTMICA (HU 9.3): 
    // Derivamos si la nota semanal es < 4.0 O si el emoji de hoy es 1 (Muy mal)
    let derivar_cvv = weeklyNote < 4;

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `Actúa como un psicólogo experto en bienestar.
    Analiza los siguientes datos de un usuario:
    - Puntaje de bienestar diario (escala 2 al 10, donde 2 es 'Muy mal' y 10 es 'Muy bien'): ${emojiScore}
    - Comentario del usuario: "${text || 'No proporcionó texto'}"
    
    Instrucciones:
    1. Si el texto sugiere ideación suicida, crisis emocional grave o riesgo inminente, pon "is_emergency" en true.
    2. Genera una sugerencia de contención empática corta (máx 200 caracteres).
    
    Respuesta estrictamente en JSON:
    { "is_emergency": boolean, "suggestion": "string" }`;

    const result = await model.generateContent(prompt);
    const cleanJson = result.response.text().replace(/```json|```/g, "").trim();
    const aiResponse = JSON.parse(cleanJson);

    if (aiResponse.is_emergency) {
      derivar_cvv = true;
    }

    return c.json({
      derivar_cvv,
      suggestion: aiResponse.suggestion,
      risk_level: derivar_cvv ? "high" : "low"
    });

  } catch (error) {
    console.error("DETALLE DEL ERROR:", error);
    return c.json({
      derivar_cvv: false,
      suggestion: "Gracias por compartir cómo te sientes hoy.",
      risk_level: "low"
    });
  }
});

export default app;

serve({
  fetch: app.fetch,
  port: 3000,
}, (info) => {
  console.log(`AppBit AI Service corriendo en http://localhost:${info.port}`);
});