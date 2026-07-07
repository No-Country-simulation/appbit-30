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
import { dbClient } from './db.client.js';
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

type SafePlanItem = {
  titulo: string;
  prioridad: string;
  curso_sugerido: string | null;
  accion_label: string | null;
};

function normalizePlanItems(items: unknown, locale?: string): SafePlanItem[] {
  if (!Array.isArray(items)) {
    return [];
  }

  return items.slice(0, 5).map((item, index) => {
    const rawItem =
      item && typeof item === 'object' ? (item as Record<string, unknown>) : {};

    return {
      titulo:
        truncateText(rawItem.titulo, 255) ??
        `${fallbackPlanTitle(locale)} ${index + 1}`,
      prioridad: truncateText(rawItem.prioridad, 50) ?? 'Media_prioridad',
      curso_sugerido: truncateText(rawItem.curso_sugerido, 255),
      accion_label: truncateText(rawItem.accion_label, 100),
    };
  });
}

function buildFallbackPlanItems(params: {
  fallbackGapItems: { habilidad: string }[];
  cursosDisponibles: { titulo: string }[];
  locale?: string;
}): SafePlanItem[] {
  const { fallbackGapItems, cursosDisponibles, locale } = params;
  const defaultCourse = cursosDisponibles[0]?.titulo ?? null;

  const itemsFromGap = fallbackGapItems.slice(0, 3).map((item, index) => ({
    titulo:
      locale === 'pt'
        ? `Reforçar fundamentos de ${item.habilidad}`
        : `Reforzar fundamentos de ${item.habilidad}`,
    prioridad: index === 0 ? 'Alta_prioridad' : 'Media_prioridad',
    curso_sugerido: defaultCourse,
    accion_label: locale === 'pt' ? 'Começar agora' : 'Empezar ahora',
  }));

  if (itemsFromGap.length > 0) {
    return itemsFromGap;
  }

  return [
    {
      titulo:
        locale === 'pt'
          ? 'Completar o primeiro curso recomendado'
          : 'Completar el primer curso recomendado',
      prioridad: 'Alta_prioridad',
      curso_sugerido: defaultCourse,
      accion_label: locale === 'pt' ? 'Ver curso' : 'Ver curso',
    },
    {
      titulo:
        locale === 'pt'
          ? 'Construir um projeto simples para praticar'
          : 'Construir un proyecto simple para practicar',
      prioridad: 'Media_prioridad',
      curso_sugerido: null,
      accion_label: locale === 'pt' ? 'Planejar projeto' : 'Planear proyecto',
    },
    {
      titulo:
        locale === 'pt'
          ? 'Atualizar o perfil com novas habilidades'
          : 'Actualizar el perfil con nuevas habilidades',
      prioridad: 'Baja_prioridad',
      curso_sugerido: null,
      accion_label: locale === 'pt' ? 'Atualizar perfil' : 'Actualizar perfil',
    },
  ];
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

    type EmojiKey = keyof typeof EMOJI_VALUES;

    const emojiKey = emoji as EmojiKey;
    const nota_actual = nota_diaria ?? EMOJI_VALUES[emojiKey];

    const totalNotas = [...historial_semanal, nota_actual];
    const nota_semanal = Number(
      (totalNotas.reduce((a, b) => a + b, 0) / totalNotas.length).toFixed(2),
    );

    const tendencia_baja =
      historial_semanal.length > 1 &&
      historial_semanal.every(
        (val: number, i: number) => i === 0 || val <= historial_semanal[i - 1]!,
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
- Tipos de conexión: ${data.tipoConexion.join(', ')}
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
5. El titulo de cada item debe tener máximo 5 palabras.
6. El accion_label debe ser texto de botón, máximo 4 palabras.
7. Cada curso_sugerido debe coincidir exactamente con el título de algún curso disponible. Si no hay curso aplicable, usá null.
8. No mezcles idiomas. Todos los textos visibles deben estar en ${idiomaRespuesta}.

REGLA ANTI-ALUCINACIÓN:
curso_sugerido debe ser exactamente uno de los títulos listados en CURSOS DISPONIBLES.
Si ningún curso aplica, usar null.
No inventes cursos, certificaciones, bootcamps ni plataformas.

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

    const aiGapItems = Array.isArray(aiResponse.gap_items)
      ? aiResponse.gap_items
      : [];

    const safeGapItems = aiGapItems.length > 0 ? aiGapItems : fallbackGapItems;

    const safeTrayectoriaSugerida =
      Array.isArray(aiResponse.trayectoria_sugerida) &&
      aiResponse.trayectoria_sugerida.length > 0
        ? aiResponse.trayectoria_sugerida.slice(0, 3)
        : [
            data.areasInteres[0]
              ? `${data.areasInteres[0]} Jr`
              : data.locale === 'pt'
                ? 'Perfil tecnológico inicial'
                : 'Perfil tecnológico inicial',
          ];

    const aiPlanAccion = normalizePlanItems(
      aiResponse.plan_accion,
      data.locale,
    );

    const fallbackPlanAccion = buildFallbackPlanItems({
      fallbackGapItems,
      cursosDisponibles,
      locale: data.locale,
    });

    const safePlanAccion =
      aiPlanAccion.length > 0 ? aiPlanAccion : fallbackPlanAccion;

    const safeGapPorcentual = clampPercent(
      data.gap_inicial ?? dbGapPorcentual ?? Number(aiResponse.gap_porcentual),
    );

    const cursoIdByExactTitle = new Map(
      cursosDisponibles.map((curso) => [
        curso.titulo.trim().toLowerCase(),
        curso.curso_id,
      ]),
    );

    const planRows = safePlanAccion.map((item, index) => {
      const cursoKey = item.curso_sugerido?.trim().toLowerCase();
      const cursoId = cursoKey
        ? (cursoIdByExactTitle.get(cursoKey) ?? null)
        : null;

      return {
        usuario_id: userId,
        titulo: item.titulo,
        prioridad: normalizePrioridad(item.prioridad),
        orden: index + 1,
        curso_vinculado_id: cursoId,
        accion_label: item.accion_label,
      };
    });

    const orientacion = await dbClient.$transaction(
      async (tx) => {
        await tx.planAccion.deleteMany({
          where: {
            usuario_id: userId,
          },
        });

        await tx.orientaciones.deleteMany({
          where: {
            usuario_id: userId,
          },
        });

        const orient = await tx.orientaciones.create({
          data: {
            usuario_id: userId,
            gap_porcentual: safeGapPorcentual,
            gap_items: safeGapItems as any,
            trayectoria_sugerida: safeTrayectoriaSugerida as any,
            vacantes_compatibles: [],
            confianza: 0.85,
            idioma_respuesta:
              data.locale === 'pt' ? IdiomaAppEnum.pt : IdiomaAppEnum.es,
          },
        });

        if (planRows.length > 0) {
          await tx.planAccion.createMany({
            data: planRows,
          });
        }

        return {
          orient,
          planCreados: planRows.length,
        };
      },
      {
        maxWait: 10000,
        timeout: 20000,
      },
    );

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
  const normalizada = prioridad.trim().toLowerCase().replace(/\s+/g, '_');

  if (
    normalizada === 'alta_prioridad' ||
    normalizada === 'alta' ||
    normalizada === 'alta_priority'
  ) {
    return PrioridadPlanEnum.Alta_prioridad;
  }

  if (
    normalizada === 'baja_prioridad' ||
    normalizada === 'baja' ||
    normalizada === 'baixa_prioridade' ||
    normalizada === 'baixa'
  ) {
    return PrioridadPlanEnum.Baja_prioridad;
  }

  return PrioridadPlanEnum.Media_prioridad;
}

export const GET = handle(app);
export const POST = handle(app);
export const OPTIONS = handle(app);
