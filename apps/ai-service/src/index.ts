/// <reference types="node" />
import { Hono } from 'hono';
import { handle } from 'hono/vercel';
import { cors } from 'hono/cors';
import { GoogleGenerativeAI } from '@google/generative-ai';
import {
  wellbeingRequestSchema,
  onboardingAIRequestSchema,
} from '@appbit/shared-schemas';
import { EMOJI_VALUES } from '@appbit/shared-types';
import { dbClient } from './db.client';
import {
  EstadoHabilidadEnum,
  PrioridadPlanEnum,
  IdiomaAppEnum,
} from '../../web/src/server/generated/prisma/index.js';
import type {
  HabilidadesMercado,
  Cursos,
} from '../../web/src/server/generated/prisma/index.js';

const app = new Hono();

app.use('*', cors());

app.get('/', (c) => c.text('AppBit AI Service - Operational'));

app.get('/health', (c) => c.json({ status: 'up' }));

// ---------------------------------------------------------------------------
// POST /wellbeing/analyze
// ---------------------------------------------------------------------------
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

    const nota_actual = nota_diaria ?? EMOJI_VALUES[emoji];

    const totalNotas = [...historial_semanal, nota_actual];
    const nota_semanal = Number(
      (totalNotas.reduce((a, b) => a + b, 0) / totalNotas.length).toFixed(2),
    );

    const tendencia_baja =
      historial_semanal.length > 1 &&
      historial_semanal.every(
        (val, i) => i === 0 || val <= historial_semanal[i - 1]!,
      );

    let derivar_cvv =
      nota_semanal < 4.0 || (tendencia_baja && nota_semanal < 5.0);
    let alerta = nota_semanal < 5.5 || tendencia_baja;

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

// ---------------------------------------------------------------------------
// POST /api/onboarding  —  Generar gemelo digital del usuario
// ---------------------------------------------------------------------------
app.post('/api/onboarding', async (c) => {
  try {
    const body = await c.req.json();

    const validation = onboardingAIRequestSchema.safeParse(body);
    if (!validation.success) {
      return c.json(
        { error: 'Datos inválidos', details: validation.error.format() },
        400,
      );
    }

    const data = validation.data;
    const userId = data.usuarioId;

    // Verificar que el usuario existe
    const usuario = await dbClient.usuarios.findUnique({
      where: { usuario_id: userId },
      select: { usuario_id: true },
    });
    if (!usuario) {
      return c.json({ error: 'Usuario no encontrado' }, 404);
    }

    // Consultar habilidades de mercado + cursos en paralelo
    const [habilidadesMercado, cursosDisponibles] = await Promise.all([
      dbClient.habilidadesMercado.findMany({
        where: {
          area_principal: data.areasInteres.length
            ? { in: data.areasInteres as any }
            : undefined,
        },
        orderBy: { nombre: 'asc' },
        select: { nombre: true, categoria: true, area_principal: true },
      }),
      dbClient.cursos.findMany({
        where: {
          activo: true,
          area: data.areasInteres.length
            ? { in: data.areasInteres as any }
            : undefined,
        },
        orderBy: { titulo: 'asc' },
        select: { titulo: true, area: true },
      }),
    ]);

    const idiomaRespuesta = data.locale === 'pt' ? 'Portugués' : 'Español';

    // Construir prompt para Gemini
    const prompt = `Actuá como asesor profesional de la App BiT para Latinoamérica.
Generá el gemelo digital de este usuario basándote en su perfil y el mercado laboral disponible.

PERFIL DEL USUARIO:
- Educación: ${data.nivelEducacion.join(', ')}
- Momento profesional: ${data.momentoProfesional.join(', ')}
- Áreas de interés: ${data.areasInteres.join(', ')}
- Idiomas: ${data.idiomas.map((i) => `${i.idioma} (${i.nivel})`).join(', ')}
- Disponibilidad: ${data.disponibilidad.join(', ')}
- Ubicación trabajo preferida: ${data.ubicacionTrabajo}
- Objetivos: ${data.objetivos.join(', ')}
- Dispositivos disponibles: ${data.dispositivos.join(', ')}
- Tipo de conexión: ${data.tipoConexion}
- Ciudad: ${data.ciudad}, ${data.pais}
- Idioma de respuesta: ${idiomaRespuesta}

HABILIDADES DEL MERCADO DISPONIBLES:
${habilidadesMercado.map((h) => `- ${h.nombre} (${h.categoria ?? 'General'}) [${h.area_principal ?? 'Multiárea'}]`).join('\n')}

CURSOS DISPONIBLES:
${cursosDisponibles.map((c) => `- ${c.titulo} (${c.area})`).join('\n')}

Instrucciones:
1. Determiná qué habilidades del mercado el usuario YA TIENE (estado: "Adquirida"),
   cuáles necesita aprender (estado: "Faltante") y cuáles está desarrollando (estado: "En_progreso").
   Sé realista: un perfil sin experiencia tendrá mayoría "Faltante".
2. Calculá el gap porcentual como: (habilidades_faltantes / total_habilidades_relevantes) * 100.
3. Sugerí una trayectoria profesional de 1 a 3 títulos de puesto.
4. Generá un plan de acción con 3 a 5 items priorizados. Cada item debe tener un curso_sugerido
   que coincida con el título de algún curso disponible (dejalo vacío si no hay curso que corresponda).

Respuesta JSON estricta (sin markdown, sin acentos en las claves):
{
  "habilidades": [{ "nombre": "string", "estado": "Adquirida"|"Faltante"|"En_progreso" }],
  "gap_porcentual": 45,
  "gap_items": [{ "habilidad": "string", "nivel_requerido": "string", "nivel_actual": "string" }],
  "trayectoria_sugerida": ["string"],
  "plan_accion": [
    {
      "titulo": "string",
      "prioridad": "Alta_prioridad"|"Media_prioridad"|"Baja_prioridad",
      "curso_sugerido": "string | null",
      "accion_label": "string"
    }
  ]
}`;

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    const result = await model.generateContent(prompt);
    const cleanJson = result.response
      .text()
      .replace(/```json|```/g, '')
      .trim();

    interface GeminiResponse {
      habilidades: { nombre: string; estado: string }[];
      gap_porcentual: number;
      gap_items: { habilidad: string; nivel_requerido: string; nivel_actual: string }[];
      trayectoria_sugerida: string[];
      plan_accion: {
        titulo: string;
        prioridad: string;
        curso_sugerido: string | null;
        accion_label: string;
      }[];
    }

    const aiResponse: GeminiResponse = JSON.parse(cleanJson);

    // Escribir en DB en una transacción
    const orientacion = await dbClient.$transaction(async (tx) => {
      // Limpiar datos previos del usuario
      await tx.usuarioHabilidades.deleteMany({ where: { usuario_id: userId } });
      await tx.orientaciones.deleteMany({ where: { usuario_id: userId } });
      await tx.planAccion.deleteMany({ where: { usuario_id: userId } });

      // Insertar habilidades del usuario
      let habilidadesCreadas = 0;
      for (const h of aiResponse.habilidades) {
        const skill = await tx.habilidadesMercado.findUnique({
          where: { nombre: h.nombre },
        });
        if (skill) {
          await tx.usuarioHabilidades.create({
            data: {
              usuario_id: userId,
              habilidad_id: skill.habilidad_id,
              estado: normalizeEstado(h.estado),
            },
          });
          habilidadesCreadas++;
        }
      }

      // Insertar orientación
      const orient = await tx.orientaciones.create({
        data: {
          usuario_id: userId,
          gap_porcentual: aiResponse.gap_porcentual,
          gap_items: aiResponse.gap_items as any,
          trayectoria_sugerida: aiResponse.trayectoria_sugerida as any,
          vacantes_compatibles: [],
          confianza: 0.85,
          idioma_respuesta:
            data.locale === 'pt' ? IdiomaAppEnum.pt : IdiomaAppEnum.es,
        },
      });

      // Insertar items del plan de acción
      let planCreados = 0;
      for (let i = 0; i < aiResponse.plan_accion.length; i++) {
        const item = aiResponse.plan_accion[i]!;
        let cursoId: string | null = null;
        if (item.curso_sugerido) {
          const curso = await tx.cursos.findFirst({
            where: {
              titulo: { contains: item.curso_sugerido, mode: 'insensitive' },
            },
            select: { curso_id: true },
          });
          cursoId = curso?.curso_id ?? null;
        }
        await tx.planAccion.create({
          data: {
            usuario_id: userId,
            titulo: item.titulo,
            prioridad: normalizePrioridad(item.prioridad),
            orden: i + 1,
            curso_vinculado_id: cursoId,
            accion_label: item.accion_label ?? null,
          },
        });
        planCreados++;
      }

      return { orient, habilidadesCreadas, planCreados };
    });

    return c.json({
      success: true,
      usuarioId: userId,
      orientacionId: orientacion.orient.orientacion_id,
      planAccionCount: orientacion.planCreados,
      habilidadesCount: orientacion.habilidadesCreadas,
    });
  } catch (error) {
    console.error('Error en onboarding AI:', error);
    return c.json(
      {
        success: false,
        usuarioId: '',
        error: 'Error al procesar onboarding',
      },
      500,
    );
  }
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function normalizeEstado(estado: string): EstadoHabilidadEnum {
  const normalizado = estado.replace(' ', '_') as EstadoHabilidadEnum;
  if (
    normalizado === EstadoHabilidadEnum.Adquirida ||
    normalizado === EstadoHabilidadEnum.En_progreso
  ) {
    return normalizado;
  }
  return EstadoHabilidadEnum.Faltante;
}

function normalizePrioridad(prioridad: string): PrioridadPlanEnum {
  const normalizado = prioridad.replace(' ', '_') as PrioridadPlanEnum;
  if (
    normalizado === PrioridadPlanEnum.Alta_prioridad ||
    normalizado === PrioridadPlanEnum.Baja_prioridad
  ) {
    return normalizado;
  }
  return PrioridadPlanEnum.Media_prioridad;
}

export const GET = handle(app);
export const POST = handle(app);
export const OPTIONS = handle(app);
