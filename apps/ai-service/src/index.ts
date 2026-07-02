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

const app = new Hono();

app.use('*', cors());

app.get('/health', (c) =>
  c.json({ status: 'up', text: 'AppBit AI Service - Operational' }),
);

function clampPercent(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function parseGeminiJson<T>(raw: string): T {
  const cleanJson = raw.replace(/```json|```/g, '').trim();
  return JSON.parse(cleanJson) as T;
}

function truncateText(value: unknown, maxLength: number) {
  if (typeof value !== 'string') {
    return null;
  }

  const cleaned = value.trim().replace(/\s+/g, ' ');

  if (!cleaned) {
    return null;
  }

  if (cleaned.length <= maxLength) {
    return cleaned;
  }

  return cleaned.slice(0, maxLength - 1).trimEnd();
}

function fallbackPlanTitle(locale?: string) {
  return locale === 'pt' ? 'Plano de ação' : 'Plan de acción';
}

function normalizePlanItems(
  items: {
    titulo: string;
    prioridad: string;
    curso_sugerido: string | null;
    accion_label: string;
  }[],
  locale?: string,
) {
  return items.slice(0, 5).map((item, index) => ({
    titulo:
      truncateText(item.titulo, 255) ??
      `${fallbackPlanTitle(locale)} ${index + 1}`,
    prioridad: item.prioridad,
    curso_sugerido: truncateText(item.curso_sugerido, 255),
    accion_label: truncateText(item.accion_label, 100),
  }));
}

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
    const alerta = nota_semanal < 5.5 || tendencia_baja;

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

    const aiResponse = parseGeminiJson<{
      emergencia: boolean;
      mensaje: string;
      accion_sugerida: string;
    }>(result.response.text());

    if (aiResponse.emergencia) {
      derivar_cvv = true;
    }

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
// POST /api/onboarding
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

    const usuario = await dbClient.usuarios.findUnique({
      where: { usuario_id: userId },
      select: { usuario_id: true },
    });

    if (!usuario) {
      return c.json({ error: 'Usuario no encontrado' }, 404);
    }

    const [habilidadesMercado, cursosDisponibles, existingUserSkills] =
      await Promise.all([
        dbClient.habilidadesMercado.findMany({
          where: {
            area_principal: data.areasInteres.length
              ? { in: data.areasInteres as any }
              : undefined,
          },
          orderBy: { nombre: 'asc' },
          select: {
            habilidad_id: true,
            nombre: true,
            categoria: true,
            area_principal: true,
          },
        }),

        dbClient.cursos.findMany({
          where: {
            activo: true,
            area: data.areasInteres.length
              ? { in: data.areasInteres as any }
              : undefined,
          },
          orderBy: { titulo: 'asc' },
          select: {
            curso_id: true,
            titulo: true,
            area: true,
          },
        }),

        dbClient.usuarioHabilidades.findMany({
          where: { usuario_id: userId },
          include: {
            habilidad: {
              select: {
                habilidad_id: true,
                nombre: true,
                categoria: true,
                area_principal: true,
              },
            },
          },
        }),
      ]);

    const idiomaRespuesta = data.locale === 'pt' ? 'Portugués' : 'Español';

    const totalUserSkills = existingUserSkills.length;

    const faltantes = existingUserSkills.filter(
      (skill) => skill.estado === EstadoHabilidadEnum.Faltante,
    ).length;

    const dbGapPorcentual =
      totalUserSkills > 0
        ? clampPercent((faltantes / totalUserSkills) * 100)
        : null;

    const fallbackGapItems = existingUserSkills
      .filter((skill) => skill.estado === EstadoHabilidadEnum.Faltante)
      .map((skill) => ({
        habilidad: skill.habilidad.nombre,
        nivel_requerido: 'Mercado',
        nivel_actual: 'Pendiente',
      }));

    const prompt = `Actuá como asesor profesional de la App BiT para Latinoamérica.
Generá el gemelo digital de este usuario basándote en su perfil y el mercado laboral disponible.

PERFIL DEL USUARIO:
- Educación: ${data.nivelEducacion.join(', ')}
- Momento profesional: ${data.momentoProfesional.join(', ')}
- Áreas de interés: ${data.areasInteres.join(', ')}
- Idiomas: ${data.idiomas.map((i) => `${i.idioma} (${i.nivel})`).join(', ')}
- Disponibilidad: ${data.disponibilidad.join(', ')}
- Ubicación trabajo preferida: ${data.ubicacionTrabajo}
- Nivel inicial declarado: ${data.nivel_inicial ?? 'No especificado'}
- Experiencia en tecnología: ${data.nivelExperienciaTecnologia}
- Habilidades técnicas declaradas: ${
      data.habilidadesTecnicas.length > 0
        ? data.habilidadesTecnicas.join(', ')
        : 'Ninguna'
    }
- Habilidades blandas declaradas: ${
      data.habilidadesBlandas.length > 0
        ? data.habilidadesBlandas.join(', ')
        : 'Ninguna'
    }
- Gap inicial declarado: ${
      data.gap_inicial != null ? `${data.gap_inicial}%` : 'No especificado'
    }
- Objetivos: ${data.objetivos.join(', ')}
- Dispositivos disponibles: ${data.dispositivos.join(', ')}
- Tipo de conexión: ${data.tipoConexion}
- Ciudad: ${data.ciudad}, ${data.pais}
- Idioma de respuesta: ${idiomaRespuesta}

HABILIDADES DEL MERCADO DISPONIBLES:
${habilidadesMercado
  .map(
    (h) =>
      `- ${h.nombre} (${h.categoria ?? 'General'}) [${h.area_principal ?? 'Multiárea'}]`,
  )
  .join('\n')}

HABILIDADES YA REGISTRADAS POR EL ONBOARDING WEB:
${existingUserSkills
  .map((h) => `- ${h.habilidad.nombre}: ${h.estado}`)
  .join('\n')}

CURSOS DISPONIBLES:
${cursosDisponibles.map((c) => `- ${c.titulo} (${c.area})`).join('\n')}

Instrucciones:
1. No borres ni contradigas las habilidades registradas por el onboarding web.
2. Si el nivel inicial declarado es "sin_conocimiento", asumí que el usuario necesita empezar desde fundamentos.
3. Calculá una trayectoria profesional realista de 1 a 3 títulos de puesto.
4. Generá un plan de acción con 3 a 5 items priorizados.
5. Cada título del plan debe tener máximo 90 caracteres.
6. Cada accion_label debe tener máximo 35 caracteres.
7. Cada curso_sugerido debe coincidir exactamente con el título de algún curso disponible. Si no hay curso aplicable, usá null.
8. Respondé en ${idiomaRespuesta}.

Respuesta JSON estricta, sin markdown:
{
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

    interface GeminiResponse {
      gap_porcentual: number;
      gap_items: {
        habilidad: string;
        nivel_requerido: string;
        nivel_actual: string;
      }[];
      trayectoria_sugerida: string[];
      plan_accion: {
        titulo: string;
        prioridad: string;
        curso_sugerido: string | null;
        accion_label: string;
      }[];
    }

    const aiResponse = parseGeminiJson<GeminiResponse>(result.response.text());

    const safePlanAccion = normalizePlanItems(
      Array.isArray(aiResponse.plan_accion) ? aiResponse.plan_accion : [],
      data.locale,
    );

    const safeGapPorcentual = clampPercent(
      data.gap_inicial ?? dbGapPorcentual ?? Number(aiResponse.gap_porcentual),
    );

    const safeGapItems =
      aiResponse.gap_items.length > 0 ? aiResponse.gap_items : fallbackGapItems;

    const orientacion = await dbClient.$transaction(async (tx) => {
      await tx.orientaciones.deleteMany({ where: { usuario_id: userId } });
      await tx.planAccion.deleteMany({ where: { usuario_id: userId } });

      const orient = await tx.orientaciones.create({
        data: {
          usuario_id: userId,
          gap_porcentual: safeGapPorcentual,
          gap_items: safeGapItems as any,
          trayectoria_sugerida: aiResponse.trayectoria_sugerida as any,
          vacantes_compatibles: [],
          confianza: 0.85,
          idioma_respuesta:
            data.locale === 'pt' ? IdiomaAppEnum.pt : IdiomaAppEnum.es,
        },
      });

      let planCreados = 0;

      for (let i = 0; i < safePlanAccion.length; i++) {
        const item = safePlanAccion[i]!;
        let cursoId: string | null = null;

        console.log('AI onboarding parsed:', {
          usuarioId: userId,
          gapPorcentual: aiResponse.gap_porcentual,
          planItems: safePlanAccion.length,
          skillsExistentes: existingUserSkills.length,
        });

        if (item.curso_sugerido) {
          const curso = await tx.cursos.findFirst({
            where: {
              titulo: {
                contains: item.curso_sugerido,
                mode: 'insensitive',
              },
            },
            select: { curso_id: true },
          });

          cursoId = curso?.curso_id ?? null;
        }

        console.log('Creating plan item:', {
          index: i + 1,
          tituloLength: item.titulo.length,
          accionLabelLength: item.accion_label?.length ?? 0,
        });

        await tx.planAccion.create({
          data: {
            usuario_id: userId,
            titulo: item.titulo,
            prioridad: normalizePrioridad(item.prioridad),
            orden: i + 1,
            curso_vinculado_id: cursoId,
            accion_label: item.accion_label,
          },
        });

        planCreados++;
      }

      return {
        orient,
        planCreados,
      };
    });

    return c.json({
      success: true,
      usuarioId: userId,
      orientacionId: orientacion.orient.orientacion_id,
      planAccionCount: orientacion.planCreados,
      habilidadesCount: existingUserSkills.length,
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
