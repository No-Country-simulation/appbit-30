/// <reference types="node" />

import { Hono, type Context } from 'hono';
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
  applyOptionalPlanCopy,
  buildDeterministicPlan,
} from './plan-action.js';
import {
  EstadoHabilidadEnum,
  PrioridadPlanEnum,
  IdiomaAppEnum,
} from '../../web/src/server/generated/prisma/index.js';

const app = new Hono();

app.use('*', cors());

const ONBOARDING_AI_GEMINI_TIMEOUT_MS = Number(
  process.env.ONBOARDING_AI_GEMINI_TIMEOUT_MS ?? 8000,
);

const ONBOARDING_AI_MAX_OUTPUT_TOKENS = Number(
  process.env.ONBOARDING_AI_MAX_OUTPUT_TOKENS ?? 4096,
);

const ONBOARDING_AI_THINKING_BUDGET = Number(
  process.env.ONBOARDING_AI_THINKING_BUDGET ?? 0,
);

const ONBOARDING_AI_PROMPT_SKILLS_LIMIT = Number(
  process.env.ONBOARDING_AI_PROMPT_SKILLS_LIMIT ?? 12,
);

const ONBOARDING_AI_RETRY_ATTEMPTS = Number(
  process.env.ONBOARDING_AI_RETRY_ATTEMPTS ?? 2,
);

const ONBOARDING_AI_RETRY_BASE_DELAY_MS = Number(
  process.env.ONBOARDING_AI_RETRY_BASE_DELAY_MS ?? 800,
);

const GEMINI_FALLBACK_MODELS = (process.env.GEMINI_FALLBACK_MODELS ?? '')
  .split(',')
  .map((model) => model.trim())
  .filter(Boolean);

async function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  errorMessage: string,
): Promise<T> {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  try {
    const timeoutPromise = new Promise<never>((_, reject) => {
      timeoutId = setTimeout(() => {
        reject(new Error(errorMessage));
      }, timeoutMs);
    });

    return await Promise.race([promise, timeoutPromise]);
  } finally {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
  }
}

function sleep(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function clampPercent(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function parseGeminiJson<T>(raw: string): T {
  const cleanJson = raw.replace(/```json|```/g, '').trim();
  return JSON.parse(cleanJson) as T;
}

type SafeGeminiParseResult<T> =
  | {
      ok: true;
      data: T;
      raw: string;
    }
  | {
      ok: false;
      raw: string;
      reason: string;
      preview: string;
    };

function safeParseGeminiJson<T>(raw: string): SafeGeminiParseResult<T> {
  const cleanJson = raw.replace(/```json|```/g, '').trim();

  if (!cleanJson) {
    return {
      ok: false,
      raw,
      reason: 'EMPTY_RESPONSE',
      preview: '',
    };
  }

  try {
    return {
      ok: true,
      data: JSON.parse(cleanJson) as T,
      raw,
    };
  } catch {
    const firstBrace = cleanJson.indexOf('{');
    const lastBrace = cleanJson.lastIndexOf('}');

    if (firstBrace >= 0 && lastBrace > firstBrace) {
      const slicedJson = cleanJson.slice(firstBrace, lastBrace + 1);

      try {
        return {
          ok: true,
          data: JSON.parse(slicedJson) as T,
          raw,
        };
      } catch {
        // Fall through to the structured invalid JSON result below.
      }
    }

    return {
      ok: false,
      raw,
      reason: 'INVALID_OR_TRUNCATED_JSON',
      preview: cleanJson.slice(0, 1000),
    };
  }
}

function getGeminiFinishReason(result: unknown) {
  const response = (
    result as {
      response?: {
        candidates?: Array<{
          finishReason?: unknown;
        }>;
      };
    }
  ).response;

  const finishReason = response?.candidates?.[0]?.finishReason;

  return typeof finishReason === 'string' ? finishReason : null;
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
  plan_redaccion: {
    key: string;
    titulo: string;
    descripcion: string;
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
    rawStatus === 404 ||
    message.includes('404') ||
    message.includes('not found') ||
    message.includes('no longer available') ||
    (message.includes('model') && message.includes('available'))
  ) {
    return {
      code: 'AI_PROVIDER_MODEL_UNAVAILABLE',
      status: 404,
    };
  }

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
    rawStatus === 503 ||
    message.includes('503') ||
    message.includes('service unavailable') ||
    message.includes('unavailable') ||
    message.includes('high demand') ||
    message.includes('overloaded') ||
    message.includes('temporarily overloaded')
  ) {
    return {
      code: 'AI_PROVIDER_OVERLOADED',
      status: 503,
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

  if (message.includes('invalid_json') || message.includes('json')) {
    return {
      code: 'AI_PROVIDER_INVALID_JSON',
      status: 502,
    };
  }

  return {
    code: 'AI_PROVIDER_ERROR',
    status: 502,
  };
}

function isRetryableGeminiError(error: unknown) {
  const classified = classifyGeminiError(error);

  return (
    classified.code === 'AI_PROVIDER_OVERLOADED' ||
    classified.code === 'AI_PROVIDER_RATE_LIMIT' ||
    classified.code === 'AI_PROVIDER_TIMEOUT'
  );
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
// GET /health
// ---------------------------------------------------------------------------
app.get('/health', (c) =>
  c.json({ status: 'up', text: 'AppBit AI Service - Operational' }),
);

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

    logStructured({
      level: 'info',
      route: 'POST /api/onboarding',
      requestId,
      message: 'AI onboarding DB preload started',
      context: {
        usuarioId: userId,
        areasInteres: data.areasInteres,
      },
    });

    const [cursosDisponibles, existingUserSkills] = await Promise.all([
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
          nivel_recomendado: true,
          tipo_contenido: true,
          habilidad_principal: true,
          habilidad: {
            select: {
              nombre: true,
            },
          },
          curso_habilidades: {
            select: {
              habilidad_id: true,
              habilidad: {
                select: {
                  nombre: true,
                },
              },
            },
          },
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

    const habilidadesMercado = existingUserSkills
      .map((skill) => skill.habilidad)
      .slice(0, ONBOARDING_AI_PROMPT_SKILLS_LIMIT);

    logStructured({
      level: 'info',
      route: 'POST /api/onboarding',
      requestId,
      message: 'AI onboarding DB preload done',
      context: {
        usuarioId: userId,
        cursosCount: cursosDisponibles.length,
        userSkillsCount: existingUserSkills.length,
        habilidadesPromptCount: habilidadesMercado.length,
        durationMs: Date.now() - startedAt,
      },
    });

    const idiomaRespuesta = data.locale === 'pt' ? 'Portugués' : 'Español';

    const totalUserSkills = existingUserSkills.length;

    const dbGapPorcentual =
      totalUserSkills > 0
        ? clampPercent(
            100 -
              existingUserSkills.reduce(
                (total, skill) => total + skill.progreso_porcentaje,
                0,
              ) /
                totalUserSkills,
          )
        : null;

    const fallbackGapItems = existingUserSkills
      .filter((skill) => skill.estado !== EstadoHabilidadEnum.Adquirida)
      .map((skill) => ({
        habilidad: skill.habilidad.nombre,
        nivel_requerido: 'Mercado',
        nivel_actual: `${skill.progreso_porcentaje}%`,
      }));

    const deterministicPlan = buildDeterministicPlan({
      skills: existingUserSkills.map((skill) => ({
        id: skill.habilidad_id,
        name: skill.habilidad.nombre,
        progress: skill.progreso_porcentaje,
      })),
      courses: cursosDisponibles.map((course) => ({
        id: course.curso_id,
        title: course.titulo,
        skillIds: Array.from(
          new Set([
            ...course.curso_habilidades.map((mapping) => mapping.habilidad_id),
            ...(course.habilidad_principal ? [course.habilidad_principal] : []),
          ]),
        ),
      })),
      locale: data.locale,
    });

    const fallbackTrayectoria = buildFallbackTrayectoria(
      data.areasInteres,
      data.locale,
    );

    const prompt = `Sos el asesor profesional de App BiT.

Generá recomendaciones personalizadas para este usuario.

Perfil:
- Área: ${data.areasInteres.map((area) => areaLabel(area, data.locale)).join(', ')}
- Educación: ${data.nivelEducacion.join(', ')}
- Momento profesional: ${data.momentoProfesional.join(', ')}
- Experiencia tecnología: ${data.nivelExperienciaTecnologia}
- Nivel inicial: ${data.nivel_inicial ?? 'No especificado'}
- Objetivos: ${data.objetivos.join(', ')}
- Idioma de respuesta: ${idiomaRespuesta}

Habilidades pendientes:
${existingUserSkills
  .filter((h) => h.estado === EstadoHabilidadEnum.Faltante)
  .slice(0, ONBOARDING_AI_PROMPT_SKILLS_LIMIT)
  .map((h) => `- ${h.habilidad.nombre}`)
  .join('\n')}

CURSOS DISPONIBLES:
${cursosDisponibles
  .map((course) => {
    const skills = Array.from(
      new Set([
        ...(course.habilidad?.nombre ? [course.habilidad.nombre] : []),
        ...course.curso_habilidades.map((mapping) => mapping.habilidad.nombre),
      ]),
    );

    return `- ${course.titulo} | área: ${course.area} | nivel: ${course.nivel_recomendado ?? 'No especificado'} | habilidades: ${skills.join(', ') || 'Sin asociación'} | tipo: ${course.tipo_contenido}`;
  })
  .join('\n')}

PLAN DE ACCIÓN FIJO (las reglas del producto ya eligieron skill, curso, prioridad y orden):
${JSON.stringify(
  deterministicPlan.map((item) => ({
    key: item.key,
    titulo_actual: item.title,
    descripcion_actual: item.description,
    accion_label_actual: item.actionLabel,
    prioridad_fija: item.priority,
    skill_id_fija: item.skillId,
    curso_id_fijo: item.courseId,
    orden_fijo: item.order,
  })),
)}

Instrucciones:
1. No borres ni contradigas las habilidades registradas por el onboarding web.
2. Si el nivel inicial declarado es "sin_conocimiento", asumí que el usuario necesita empezar desde fundamentos.
3. Calculá una trayectoria profesional realista de 1 a 3 títulos de puesto.
4. No elijas, agregues, elimines ni reordenes pasos del plan fijo.
5. No decidas cursos, habilidades ni prioridades: esos campos son inmutables y no deben aparecer en tu respuesta.
6. Solo podés mejorar titulo, descripcion y accion_label de cada key recibida.
7. El titulo debe tener máximo 5 palabras y accion_label máximo 4 palabras.
8. Conservá exactamente cada key y devolvé una sola entrada por key.
9. No inventes cursos, certificaciones, bootcamps ni plataformas.
10. No mezcles idiomas. Todos los textos visibles deben estar en ${idiomaRespuesta}.

Respuesta JSON estricta, sin markdown:
{
  "gap_porcentual": number,
  "gap_items": [
    {
      "habilidad": "string",
      "nivel_requerido": "string",
      "nivel_actual": "string"
    }
  ],
  "trayectoria_sugerida": ["string"],
  "plan_redaccion": [
    {
      "key": "key recibida",
      "titulo": "string",
      "descripcion": "string",
      "accion_label": "string"
    }
  ]
}

Reglas:
- Máximo 3 gap_items.
- Todo texto visible debe estar en ${idiomaRespuesta}.`;

    let aiResponse: GeminiResponse | null = null;
    let aiProviderStatus: 'ok' | 'fallback' = 'ok';
    let fallbackReason: string | null = null;

    try {
      if (!process.env.GEMINI_API_KEY) {
        throw new Error('GEMINI_API_KEY is missing');
      }

      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

      const generationConfig = {
        temperature: 0.1,
        maxOutputTokens: ONBOARDING_AI_MAX_OUTPUT_TOKENS,
        responseMimeType: 'application/json',
        thinkingConfig: {
          thinkingBudget: ONBOARDING_AI_THINKING_BUDGET,
        },
      } as any;

      const primaryModel = process.env.GEMINI_MODEL ?? 'gemini-2.5-flash';
      const modelNames = Array.from(
        new Set([primaryModel, ...GEMINI_FALLBACK_MODELS]),
      );

      let result: Awaited<
        ReturnType<
          ReturnType<typeof genAI.getGenerativeModel>['generateContent']
        >
      > | null = null;
      let lastGeminiError: unknown = null;

      for (const modelName of modelNames) {
        for (
          let attempt = 1;
          attempt <= ONBOARDING_AI_RETRY_ATTEMPTS;
          attempt++
        ) {
          const attemptStartedAt = Date.now();

          try {
            const model = genAI.getGenerativeModel({
              model: modelName,
              generationConfig,
            });

            logStructured({
              level: 'info',
              route: 'POST /api/onboarding',
              requestId,
              message: 'Gemini onboarding generation attempt started',
              context: {
                usuarioId: userId,
                model: modelName,
                attempt,
                maxAttempts: ONBOARDING_AI_RETRY_ATTEMPTS,
                timeoutMs: ONBOARDING_AI_GEMINI_TIMEOUT_MS,
                maxOutputTokens: ONBOARDING_AI_MAX_OUTPUT_TOKENS,
                thinkingBudget: ONBOARDING_AI_THINKING_BUDGET,
                promptChars: prompt.length,
                cursosCount: cursosDisponibles.length,
                habilidadesCount: existingUserSkills.length,
                durationMs: Date.now() - startedAt,
              },
            });

            const geminiPromise = model.generateContent(prompt);

            // Evita unhandled rejection si el timeout gana la carrera.
            geminiPromise.catch(() => undefined);

            result = await withTimeout(
              geminiPromise,
              ONBOARDING_AI_GEMINI_TIMEOUT_MS,
              'GEMINI_ONBOARDING_TIMEOUT',
            );

            logStructured({
              level: 'info',
              route: 'POST /api/onboarding',
              requestId,
              message: 'Gemini onboarding generation attempt done',
              context: {
                usuarioId: userId,
                model: modelName,
                attempt,
                finishReason: getGeminiFinishReason(result),
                rawLength: result.response.text().length,
                attemptDurationMs: Date.now() - attemptStartedAt,
                durationMs: Date.now() - startedAt,
              },
            });

            break;
          } catch (attemptError) {
            lastGeminiError = attemptError;

            const classifiedAttempt = classifyGeminiError(attemptError);
            const retryable = isRetryableGeminiError(attemptError);
            const isLastAttemptForModel =
              attempt >= ONBOARDING_AI_RETRY_ATTEMPTS;
            const hasMoreModels =
              modelNames.indexOf(modelName) < modelNames.length - 1;

            logStructured({
              level: retryable ? 'warn' : 'error',
              route: 'POST /api/onboarding',
              requestId,
              message: 'Gemini onboarding generation attempt failed',
              error: attemptError,
              context: {
                usuarioId: userId,
                model: modelName,
                attempt,
                providerStatus: classifiedAttempt.status,
                providerCode: classifiedAttempt.code,
                retryable,
                isLastAttemptForModel,
                hasMoreModels,
                attemptDurationMs: Date.now() - attemptStartedAt,
                durationMs: Date.now() - startedAt,
              },
            });

            if (!retryable || isLastAttemptForModel) {
              break;
            }

            const delayMs =
              ONBOARDING_AI_RETRY_BASE_DELAY_MS * Math.pow(2, attempt - 1);

            await sleep(delayMs);
          }
        }

        if (result) {
          break;
        }
      }

      if (!result) {
        throw lastGeminiError ?? new Error('GEMINI_GENERATION_FAILED');
      }

      const rawGeminiText = result.response.text();
      const finishReason = getGeminiFinishReason(result);
      const parsedGemini = safeParseGeminiJson<GeminiResponse>(rawGeminiText);

      if (!parsedGemini.ok) {
        logStructured({
          level: 'warn',
          route: 'POST /api/onboarding',
          requestId,
          message: 'Gemini returned invalid onboarding JSON',
          context: {
            usuarioId: userId,
            reason: parsedGemini.reason,
            finishReason,
            rawPreview: parsedGemini.preview,
            rawLength: parsedGemini.raw.length,
            durationMs: Date.now() - startedAt,
          },
        });

        throw new Error(`GEMINI_INVALID_JSON:${parsedGemini.reason}`);
      }

      aiResponse = parsedGemini.data;

      logStructured({
        level: 'info',
        route: 'POST /api/onboarding',
        requestId,
        message: 'Gemini onboarding generation done',
        context: {
          usuarioId: userId,
          finishReason,
          rawLength: rawGeminiText.length,
          durationMs: Date.now() - startedAt,
        },
      });
    } catch (error) {
      const classified = classifyGeminiError(error);

      aiProviderStatus = 'fallback';
      fallbackReason = classified.code;

      logStructured({
        level: 'warn',
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

    const safePlanAccion = applyOptionalPlanCopy(
      deterministicPlan,
      aiResponse?.plan_redaccion,
    );

    const aiGapPercent = toFiniteNumber(aiResponse?.gap_porcentual);

    const fallbackGapPercent =
      data.nivel_inicial === 'sin_conocimiento' ? 100 : 50;

    const safeGapPorcentual = clampPercent(
      data.gap_inicial ?? dbGapPorcentual ?? aiGapPercent ?? fallbackGapPercent,
    );

    const planRows = safePlanAccion.map((item) => ({
      usuario_id: userId,
      titulo: item.title,
      prioridad: normalizePrioridad(item.priority),
      orden: item.order,
      curso_vinculado_id: item.courseId,
      skill_objetivo_id: item.skillId,
      tipo_item: item.courseId ? 'course' : 'action',
      descripcion: item.description,
      estado: 'pending',
      accion_label: item.actionLabel,
      completado: false,
    }));

    const orientacion = await dbClient.$transaction(
      async (tx) => {
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

        await tx.planAccion.deleteMany({
          where: {
            usuario_id: userId,
            completado: false,
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
        planReplaced: true,
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
      planReplaced: true,
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
