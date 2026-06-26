/// <reference types="node" />
import 'dotenv/config';
import { Hono } from 'hono';
import { handle } from 'hono/vercel';
import { cors } from 'hono/cors';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { wellbeingRequestSchema } from '@appbit/shared-schemas';
import { EMOJI_VALUES } from '@appbit/shared-types';

const app = new Hono();

app.use('*', cors());

app.get('/', (c) => c.text('AppBit AI Service - Operational'));

app.get('/health', (c) => c.json({ status: 'up' }));

app.post('/wellbeing/analyze', async (c) => {
  try {
    const body = await c.req.json();

    const validation = wellbeingRequestSchema.safeParse(body);
    if (!validation.success) {
      return c.json(
        { error: 'Datos inválidos', details: validation.error.format() },
        400,
      );
    }

    const {
      emoji,
      nota_diaria,
      motivo,
      contexto,
      historial_semanal = [],
      idioma,
    } = validation.data;

    // 1. Inferencia de nota actual
    const nota_actual = nota_diaria ?? EMOJI_VALUES[emoji];

    // 2. Cálculo de nota semanal (promedio historial + hoy)
    const totalNotas = [...historial_semanal, nota_actual];
    const nota_semanal = Number(
      (totalNotas.reduce((a, b) => a + b, 0) / totalNotas.length).toFixed(2),
    );

    // 3. Detección de tendencia bajista (según documento de salud)
    const tendencia_baja =
      historial_semanal.length > 1 &&
      historial_semanal.every(
        (val, i) => i === 0 || val <= historial_semanal[i - 1]!,
      );

    // 4. Reglas de derivación y alerta
    let derivar_cvv =
      nota_semanal < 4.0 || (tendencia_baja && nota_semanal < 5.0);
    let alerta = nota_semanal < 5.5 || tendencia_baja;

    // 5. Llamada a Gemini
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const prompt = `Actúa como psicólogo experto de la App BiT.
    Analiza este check-in emocional:
    - Estado: ${emoji} (Nota: ${nota_actual}/10)
    - Motivo: "${motivo || 'No proporcionado'}"
    - Contexto: "${contexto || 'No proporcionado'}"
    - Promedio semanal: ${nota_semanal}/10
    - Tendencia bajista: ${tendencia_baja ? 'Sí' : 'No'}
    - Idioma de respuesta: ${idioma}

    Instrucciones:
    1. Si el texto sugiere autolesión, ideación suicida o crisis aguda, pon "emergencia" en true.
    2. Genera un mensaje empático corto (máx 150 caracteres).
    3. Sugiere una acción concreta y alcanzable para mejorar su estado.

    Respuesta JSON estricta:
    {
      "emergencia": boolean,
      "mensaje": "string",
      "accion_sugerida": "string"
    }`;

    const result = await model.generateContent(prompt);
    const cleanJson = result.response
      .text()
      .replace(/```json|```/g, '')
      .trim();
    const aiResponse = JSON.parse(cleanJson);

    if (aiResponse.emergencia) derivar_cvv = true;

    return c.json({
      nota_actual,
      nota_semanal,
      mensaje: aiResponse.mensaje,
      accion_sugerida: aiResponse.accion_sugerida,
      derivar_cvv,
      alerta,
    });
  } catch (error) {
    console.error('DETALLE DEL ERROR:', error);
    return c.json({
      nota_actual: 5.0,
      nota_semanal: 5.0,
      mensaje: 'Gracias por compartir cómo te sientes hoy.',
      accion_sugerida: 'Tómate un momento para respirar profundo.',
      derivar_cvv: false,
      alerta: false,
    });
  }
});

export const GET = handle(app);
export const POST = handle(app);
export const OPTIONS = handle(app);
