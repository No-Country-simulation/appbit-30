/// <reference types="node" />

import { Hono, type Context } from 'hono';
import { handle } from 'hono/vercel';
import { cors } from 'hono/cors';
import { GoogleGenerativeAI } from '@google/generative-ai';
import {
  wellbeingRequestSchema,
  onboardingAIRequestSchema,
  jobMatchRequestSchema,
  learningPathRequestSchema,
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

type LogLevel = 'info' | 'warn' | 'error';

interface LogStructuredParams {
  level: LogLevel;
  route: string;
  requestId: string;
  message: string;
  error?: unknown;
  context?: Record<string, unknown>;
}

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

function getRequestId(c: Context) {
  return c.req.header('x-request-id') || crypto.randomUUID();
}

function serializeError(error: unknown) {
  if (error instanceof Error) {
    const errorWithExtra = error as Error & {
      code?: unknown;
      status?: unknown;
      statusCode?: unknown;
      response?: unknown;
      cause?: unknown;
    };

    return {
      name: error.name,
      message: error.message,
      stack: error.stack,
      code: errorWithExtra.code,
      status: errorWithExtra.status,
      statusCode: errorWithExtra.statusCode,
      response: errorWithExtra.response,
      cause:
        errorWithExtra.cause instanceof Error
          ? {
              name: errorWithExtra.cause.name,
              message: errorWithExtra.cause.message,
              stack: errorWithExtra.cause.stack,
            }
          : errorWithExtra.cause,
    };
  }

  return { message: String(error) };
}

function logStructured({
  level,
  route,
  requestId,
  message,
  error,
  context,
}: LogStructuredParams) {
  const payload = {
    level,
    route,
    requestId,
    timestamp: new Date().toISOString(),
    message,
    ...(error ? { error: serializeError(error) } : {}),
    ...(context ? { context } : {}),
  };

  const line = JSON.stringify(payload);

  if (level === 'error') {
    console.error(line);
    return;
  }

  if (level === 'warn') {
    console.warn(line);
    return;
  }

  console.info(line);
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return String(error);
}

function classifyGeminiError(error: unknown) {
  const message = getErrorMessage(error).toLowerCase();

  const extra = error as {
    status?: unknown;
    statusCode?: unknown;
    code?: unknown;
  };

  const rawStatus = Number(extra.status ?? extra.statusCode ?? extra.code);

  if (
    rawStatus === 429 ||
    message.includes('429') ||
    message.includes('too many requests') ||
    message.includes('rate limit') ||
    message.includes('quota') ||
    message.includes('resource exhausted')
  ) {
    return {
      code: 'AI_PROVIDER_RATE_LIMIT',
      status: 429,
    };
  }

  if (
    message.includes('timeout') ||
    message.includes('aborted') ||
    message.includes('abort')
  ) {
    return {
      code: 'AI_PROVIDER_TIMEOUT',
      status: 503,
    };
  }

  return {
    code: 'AI_PROVIDER_ERROR',
    status: 502,
  };
}

function toFiniteNumber(value: unknown) {
  const numberValue = Number(value);

  if (!Number.isFinite(numberValue)) {
    return null;
  }

  return numberValue;
}

function areaLabel(area: string, locale?: string) {
  const labels: Record<string, { es: string; pt: string }> = {
    Data_Analytics: {
      es: 'Data & Analytics',
      pt: 'Data & Analytics',
    },
    Desarrollo_Web: {
      es: 'Desarrollo Web',
      pt: 'Desenvolvimento Web',
    },
    UX_UI_Design: {
      es: 'UX / UI Design',
      pt: 'UX / UI Design',
    },
    Ciberseguridad: {
      es: 'Ciberseguridad',
      pt: 'Cibersegurança',
    },
    Cloud_DevOps: {
      es: 'Cloud & DevOps',
      pt: 'Cloud & DevOps',
    },
    Inteligencia_Artificial: {
      es: 'Inteligencia Artificial',
      pt: 'Inteligência Artificial',
    },
    Marketing_Digital: {
      es: 'Marketing Digital',
      pt: 'Marketing Digital',
    },
    Product_Management: {
      es: 'Product Management',
      pt: 'Product Management',
    },
  };

  const selectedLocale = locale === 'pt' ? 'pt' : 'es';

  return labels[area]?.[selectedLocale] ?? area.replaceAll('_', ' ');
}

function buildFallbackTrayectoria(areasInteres: string[], locale?: string) {
  if (areasInteres.length === 0) {
    return [
      locale === 'pt'
        ? 'Perfil tecnológico inicial'
        : 'Perfil tecnológico inicial',
    ];
  }

  const labels = areasInteres
    .slice(0, 2)
    .map((area) => areaLabel(area, locale));
  const suffix = areasInteres.length > 2 ? ` +${areasInteres.length - 2}` : '';

  return [
    locale === 'pt'
      ? `Rota inicial em ${labels.join(' + ')}${suffix}`
      : `Ruta inicial en ${labels.join(' + ')}${suffix}`,
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
  const requestId = getRequestId(c);
  const startedAt = Date.now();
  let debugUserId = '';

  try {
    const body = await c.req.json();

    const validation = onboardingAIRequestSchema.safeParse(body);
    if (!validation.success) {
      logStructured({
        level: 'warn',
        route: 'POST /api/onboarding',
        requestId,
        message: 'Invalid onboarding AI payload',
        context: {
          details: validation.error.format(),
        },
      });

      return c.json(
        {
          success: false,
          requestId,
          code: 'VALIDATION_ERROR',
          error: 'Datos inválidos',
          details: validation.error.format(),
        },
        400,
      );
    }

    const data = validation.data;
    const userId = data.usuarioId;
    debugUserId = userId;

    const usuario = await dbClient.usuarios.findUnique({
      where: { usuario_id: userId },
      select: { usuario_id: true },
    });

    if (!usuario) {
      logStructured({
        level: 'warn',
        route: 'POST /api/onboarding',
        requestId,
        message: 'Usuario not found',
        context: {
          usuarioId: userId,
        },
      });

      return c.json(
        {
          success: false,
          requestId,
          code: 'USER_NOT_FOUND',
          error: 'Usuario no encontrado',
        },
        404,
      );
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

    const fallbackPlanAccion = buildFallbackPlanItems({
      fallbackGapItems,
      cursosDisponibles,
      locale: data.locale,
    });

    const fallbackTrayectoria = buildFallbackTrayectoria(
      data.areasInteres,
      data.locale,
    );

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

    let aiResponse: GeminiResponse | null = null;
    let aiProviderStatus: 'ok' | 'fallback' = 'ok';
    let fallbackReason: string | null = null;

    try {
      if (!process.env.GEMINI_API_KEY) {
        throw new Error('GEMINI_API_KEY is missing');
      }

      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
      const result = await model.generateContent(prompt);

      aiResponse = parseGeminiJson<GeminiResponse>(result.response.text());
    } catch (error) {
      const classified = classifyGeminiError(error);

      aiProviderStatus = 'fallback';
      fallbackReason = classified.code;

      logStructured({
        level: 'error',
        route: 'POST /api/onboarding',
        requestId,
        message:
          'Gemini onboarding generation failed; using fallback recommendations',
        error,
        context: {
          usuarioId: userId,
          providerStatus: classified.status,
          providerCode: classified.code,
          locale: data.locale,
          areasInteres: data.areasInteres,
          durationMs: Date.now() - startedAt,
        },
      });
    }

    const aiGapItems =
      aiResponse && Array.isArray(aiResponse.gap_items)
        ? aiResponse.gap_items
        : [];

    const safeGapItems = aiGapItems.length > 0 ? aiGapItems : fallbackGapItems;

    const safeTrayectoriaSugerida =
      aiResponse &&
      Array.isArray(aiResponse.trayectoria_sugerida) &&
      aiResponse.trayectoria_sugerida.length > 0
        ? aiResponse.trayectoria_sugerida.slice(0, 3)
        : fallbackTrayectoria;

    const aiPlanAccion = aiResponse
      ? normalizePlanItems(aiResponse.plan_accion, data.locale)
      : [];

    const safePlanAccion =
      aiPlanAccion.length > 0 ? aiPlanAccion : fallbackPlanAccion;

    const aiGapPercent = toFiniteNumber(aiResponse?.gap_porcentual);

    const fallbackGapPercent =
      data.nivel_inicial === 'sin_conocimiento' ? 100 : 50;

    const safeGapPorcentual = clampPercent(
      data.gap_inicial ?? dbGapPorcentual ?? aiGapPercent ?? fallbackGapPercent,
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
            confianza: aiProviderStatus === 'ok' ? 0.85 : 0.55,
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

    logStructured({
      level: aiProviderStatus === 'ok' ? 'info' : 'warn',
      route: 'POST /api/onboarding',
      requestId,
      message:
        aiProviderStatus === 'ok'
          ? 'AI onboarding recommendations generated'
          : 'Fallback onboarding recommendations generated',
      context: {
        usuarioId: userId,
        orientacionId: orientacion.orient.orientacion_id,
        planAccionCount: orientacion.planCreados,
        habilidadesCount: existingUserSkills.length,
        aiProviderStatus,
        fallbackReason,
        durationMs: Date.now() - startedAt,
      },
    });

    return c.json({
      success: true,
      requestId,
      usuarioId: userId,
      orientacionId: orientacion.orient.orientacion_id,
      planAccionCount: orientacion.planCreados,
      habilidadesCount: existingUserSkills.length,
      aiProviderStatus,
      fallbackReason,
    });
  } catch (error) {
    logStructured({
      level: 'error',
      route: 'POST /api/onboarding',
      requestId,
      message: 'AI onboarding route failed',
      error,
      context: {
        usuarioId: debugUserId,
        durationMs: Date.now() - startedAt,
      },
    });

    return c.json(
      {
        success: false,
        requestId,
        usuarioId: debugUserId,
        code: 'AI_ONBOARDING_FAILED',
        error: 'Error al procesar onboarding',
      },
      500,
    );
  }
});

// ---------------------------------------------------------------------------
// POST /job-match/calculate
// ---------------------------------------------------------------------------
app.post('/job-match/calculate', async (c) => {
  const requestId = getRequestId(c);
  const startedAt = Date.now();

  try {
    const body = await c.req.json();

    const validation = jobMatchRequestSchema.safeParse(body);
    if (!validation.success) {
      logStructured({
        level: 'warn',
        route: 'POST /job-match/calculate',
        requestId,
        message: 'Invalid job match payload',
        context: {
          details: validation.error.format(),
        },
      });

      return c.json(
        {
          success: false,
          requestId,
          code: 'VALIDATION_ERROR',
          error: 'Datos inválidos',
          details: validation.error.format(),
        },
        400,
      );
    }

    const { userId, userProfile, jobVacancy, commuteScore } = validation.data;

    const fallbackTechnicalScore = (() => {
      if (userProfile.skills.length === 0 || jobVacancy.requiredSkills.length === 0) return 0;
      const userSkillSet = new Set(userProfile.skills.map((s) => s.toLowerCase().trim()));
      const matches = jobVacancy.requiredSkills.filter((s) =>
        userSkillSet.has(s.toLowerCase().trim()),
      ).length;
      return Math.round((matches / jobVacancy.requiredSkills.length) * 100);
    })();

    let aiResponse: {
      technicalScore: number;
      gaps: string[];
      summary: string;
    } | null = null;
    let aiProviderStatus: 'ok' | 'fallback' = 'ok';
    let fallbackReason: string | null = null;

    try {
      if (!process.env.GEMINI_API_KEY) {
        throw new Error('GEMINI_API_KEY is missing');
      }

      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

      const prompt = `Actuá como asesor de empleabilidad de la App BiT.
Compará el perfil del usuario con los requisitos de la vacante y determiná su compatibilidad.

PERFIL DEL USUARIO:
- Habilidades: ${userProfile.skills.join(', ')}
- Educación: ${userProfile.education}
- Nivel de inglés: ${userProfile.englishLevel}

VACANTE:
- Título: ${jobVacancy.title}
- Habilidades requeridas: ${jobVacancy.requiredSkills.join(', ')}
- Educación requerida: ${jobVacancy.requiredEducation}
- Nivel de inglés requerido: ${jobVacancy.requiredEnglishLevel}

Instrucciones:
1. Calculá un technicalScore (0-100) basado en qué tanto cubre el perfil los requisitos.
2. Identificá las habilidades faltantes (gaps) que el usuario debería adquirir.
3. Generá un resumen breve (máx 200 caracteres) con la recomendación.

Respuesta JSON estricta, sin markdown:
{
  "technicalScore": number,
  "gaps": string[],
  "summary": string
}`;

      const result = await model.generateContent(prompt);
      aiResponse = parseGeminiJson<{
        technicalScore: number;
        gaps: string[];
        summary: string;
      }>(result.response.text());
    } catch (error) {
      const classified = classifyGeminiError(error);
      aiProviderStatus = 'fallback';
      fallbackReason = classified.code;

      logStructured({
        level: 'error',
        route: 'POST /job-match/calculate',
        requestId,
        message: 'Gemini job match failed; using fallback calculation',
        error,
        context: {
          usuarioId: userId,
          providerStatus: classified.status,
          providerCode: classified.code,
          durationMs: Date.now() - startedAt,
        },
      });
    }

    const validAiResponse =
      aiResponse &&
      typeof aiResponse.technicalScore === 'number' &&
      !Number.isNaN(aiResponse.technicalScore);

    const technicalCompatibility = validAiResponse
      ? Math.round(Math.max(0, Math.min(100, aiResponse!.technicalScore)))
      : fallbackTechnicalScore;

    const gaps =
      validAiResponse && Array.isArray(aiResponse!.gaps)
        ? aiResponse!.gaps
        : [];

    const summary =
      validAiResponse && aiResponse!.summary
        ? aiResponse!.summary
        : `Compatibilidad técnica: ${technicalCompatibility}%`;

    const matchScore = Math.round(
      technicalCompatibility * 0.85 + commuteScore * 0.15,
    );

    logStructured({
      level: aiProviderStatus === 'ok' ? 'info' : 'warn',
      route: 'POST /job-match/calculate',
      requestId,
      message:
        aiProviderStatus === 'ok'
          ? 'Job match calculated with AI'
          : 'Job match calculated with fallback',
      context: {
        usuarioId: userId,
        vacanteId: jobVacancy.id,
        matchScore,
        technicalCompatibility,
        gapsCount: gaps.length,
        aiProviderStatus,
        fallbackReason,
        durationMs: Date.now() - startedAt,
      },
    });

    return c.json({
      matchScore,
      technicalCompatibility,
      gaps,
      summary,
    });
  } catch (error) {
    logStructured({
      level: 'error',
      route: 'POST /job-match/calculate',
      requestId,
      message: 'Job match route failed',
      error,
      context: {
        durationMs: Date.now() - startedAt,
      },
    });

    return c.json(
      {
        success: false,
        requestId,
        code: 'JOB_MATCH_FAILED',
        error: 'Error al calcular match',
      },
      500,
    );
  }
});

// ---------------------------------------------------------------------------
// POST /learning-path/recommend
// ---------------------------------------------------------------------------
app.post('/learning-path/recommend', async (c) => {
  const requestId = getRequestId(c);
  const startedAt = Date.now();

  try {
    const body = await c.req.json();

    const validation = learningPathRequestSchema.safeParse(body);
    if (!validation.success) {
      logStructured({
        level: 'warn',
        route: 'POST /learning-path/recommend',
        requestId,
        message: 'Invalid learning path payload',
        context: {
          details: validation.error.format(),
        },
      });

      return c.json(
        {
          success: false,
          requestId,
          code: 'VALIDATION_ERROR',
          error: 'Datos inválidos',
          details: validation.error.format(),
        },
        400,
      );
    }

    const { userId, gapItems, courseCatalog } = validation.data;

    const fallbackRecommendations = (() => {
      const lowerGaps = gapItems.map((g) => g.toLowerCase().trim());
      const matched = courseCatalog
        .filter((c) => lowerGaps.some((g) => c.habilidad_principal.toLowerCase().includes(g) || g.includes(c.habilidad_principal.toLowerCase())))
        .sort((a, b) => {
          if (a.es_gratis && !b.es_gratis) return -1;
          if (!a.es_gratis && b.es_gratis) return 1;
          return a.duracion_horas - b.duracion_horas;
        })
        .slice(0, 5)
        .map((c) => ({
          courseId: c.id,
          title: c.title,
          reason: c.es_gratis ? 'Curso gratuito que cubre esta habilidad' : 'Curso recomendado para esta área',
        }));

      return matched;
    })();

    let aiResponse: { recommendations: { courseId: string; title: string; reason: string }[] } | null = null;
    let aiProviderStatus: 'ok' | 'fallback' = 'ok';
    let fallbackReason: string | null = null;

    try {
      if (!process.env.GEMINI_API_KEY) {
        throw new Error('GEMINI_API_KEY is missing');
      }

      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

      const prompt = `Actuá como asesor de aprendizaje de la App BiT.
Dado un usuario con estas brechas de habilidades (gaps), recomendá los mejores cursos del catálogo para cubrirlas.

GAPS DEL USUARIO:
${gapItems.join(', ')}

CATÁLOGO DE CURSOS DISPONIBLES:
${JSON.stringify(
  courseCatalog.map((c) => ({
    id: c.id,
    title: c.title,
    habilidad_principal: c.habilidad_principal,
    es_gratis: c.es_gratis,
    duracion_horas: c.duracion_horas,
  })),
  null,
  2,
)}

Instrucciones:
1. Elegí hasta 5 cursos que mejor cubran los gaps del usuario.
2. Priorizá cursos GRATIS y de menor duración.
3. No repitas cursos.
4. Cada recomendación debe incluir una razón breve (máx 100 caracteres).

Respuesta JSON estricta, sin markdown:
{
  "recommendations": [
    { "courseId": string, "title": string, "reason": string }
  ]
}`;

      const result = await model.generateContent(prompt);
      aiResponse = parseGeminiJson<{
        recommendations: { courseId: string; title: string; reason: string }[];
      }>(result.response.text());
    } catch (error) {
      const classified = classifyGeminiError(error);
      aiProviderStatus = 'fallback';
      fallbackReason = classified.code;

      logStructured({
        level: 'error',
        route: 'POST /learning-path/recommend',
        requestId,
        message: 'Gemini learning path failed; using fallback recommendations',
        error,
        context: {
          usuarioId: userId,
          providerStatus: classified.status,
          providerCode: classified.code,
          durationMs: Date.now() - startedAt,
        },
      });
    }

    const validAiResponse =
      aiResponse &&
      Array.isArray(aiResponse.recommendations) &&
      aiResponse.recommendations.length > 0;

    const recommendations = validAiResponse
      ? aiResponse!.recommendations.slice(0, 5)
      : fallbackRecommendations;

    logStructured({
      level: aiProviderStatus === 'ok' ? 'info' : 'warn',
      route: 'POST /learning-path/recommend',
      requestId,
      message:
        aiProviderStatus === 'ok'
          ? 'Learning path recommendations generated with AI'
          : 'Learning path recommendations generated with fallback',
      context: {
        usuarioId: userId,
        recommendationsCount: recommendations.length,
        aiProviderStatus,
        fallbackReason,
        durationMs: Date.now() - startedAt,
      },
    });

    return c.json({
      gaps: gapItems,
      recommendations,
    });
  } catch (error) {
    logStructured({
      level: 'error',
      route: 'POST /learning-path/recommend',
      requestId,
      message: 'Learning path route failed',
      error,
      context: {
        durationMs: Date.now() - startedAt,
      },
    });

    return c.json(
      {
        success: false,
        requestId,
        code: 'LEARNING_PATH_FAILED',
        error: 'Error al generar recomendaciones',
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
