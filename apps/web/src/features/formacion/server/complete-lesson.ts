import { dbClient } from '@/src/server/clients/db.client';
import { Prisma } from '@/src/server/generated/prisma';
import {
  calculateLearningProgressBySkill,
  clampPercent,
  getUserSkillsMatch,
  skillStatusFromProgress,
} from '@/src/server/progress/skill-progress';

export class LearningProgressError extends Error {
  constructor(
    readonly code: 'LESSON_NOT_FOUND' | 'COURSE_INACTIVE',
    message: string,
  ) {
    super(message);
    this.name = 'LearningProgressError';
  }
}

interface SkillProgress {
  skillId: string;
  progress: number;
}

function getCourseSkillProgress(params: {
  lessonMappings: ReadonlyArray<{
    lessonId: string;
    skillId: string;
    weight: number;
  }>;
  courseSkillIds: readonly string[];
  completedLessonIds: ReadonlySet<string>;
  courseProgress: number;
}) {
  if (params.lessonMappings.length > 0) {
    return calculateLearningProgressBySkill(params);
  }

  return Array.from(new Set(params.courseSkillIds), (skillId) => ({
    skillId,
    progress: params.courseProgress,
  }));
}

async function updateSkillProgress(
  tx: Prisma.TransactionClient,
  usuarioId: string,
  progressRows: readonly SkillProgress[],
) {
  for (const row of progressRows) {
    const existing = await tx.usuarioHabilidades.findUnique({
      where: {
        usuario_id_habilidad_id: {
          usuario_id: usuarioId,
          habilidad_id: row.skillId,
        },
      },
      select: { progreso_porcentaje: true },
    });

    const progress = Math.max(
      existing?.progreso_porcentaje ?? 0,
      clampPercent(row.progress),
    );

    await tx.usuarioHabilidades.upsert({
      where: {
        usuario_id_habilidad_id: {
          usuario_id: usuarioId,
          habilidad_id: row.skillId,
        },
      },
      create: {
        usuario_id: usuarioId,
        habilidad_id: row.skillId,
        progreso_porcentaje: progress,
        estado: skillStatusFromProgress(progress),
      },
      update: {
        progreso_porcentaje: progress,
        estado: skillStatusFromProgress(progress),
        actualizado_en: new Date(),
      },
    });
  }
}

export async function completeLesson(params: {
  usuarioId: string;
  leccionId: string;
}) {
  let lastError: unknown;

  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      return await dbClient.$transaction(
        async (tx) => {
      const lesson = await tx.lecciones.findUnique({
        where: { leccion_id: params.leccionId },
        select: {
          leccion_id: true,
          titulo: true,
          modulo: {
            select: {
              modulo_id: true,
              titulo: true,
              curso: {
                select: {
                  curso_id: true,
                  titulo: true,
                  activo: true,
                  habilidad_principal: true,
                  curso_habilidades: {
                    select: { habilidad_id: true },
                  },
                  modulos: {
                    select: {
                      modulo_id: true,
                      titulo: true,
                      lecciones: {
                        select: {
                          leccion_id: true,
                          leccion_habilidades: {
                            select: {
                              habilidad_id: true,
                              peso: true,
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      });

      if (!lesson) {
        throw new LearningProgressError(
          'LESSON_NOT_FOUND',
          'No encontramos la lección solicitada.',
        );
      }

      const course = lesson.modulo.curso;

      if (!course.activo) {
        throw new LearningProgressError(
          'COURSE_INACTIVE',
          'El curso ya no está disponible.',
        );
      }

      const previousProgress = await tx.progresoLeccion.findUnique({
        where: {
          usuario_id_leccion_id: {
            usuario_id: params.usuarioId,
            leccion_id: params.leccionId,
          },
        },
        select: { estado: true },
      });

      const matchBefore = await getUserSkillsMatch(tx, params.usuarioId);

      await tx.progresoLeccion.upsert({
        where: {
          usuario_id_leccion_id: {
            usuario_id: params.usuarioId,
            leccion_id: params.leccionId,
          },
        },
        create: {
          usuario_id: params.usuarioId,
          leccion_id: params.leccionId,
          estado: 'Completada',
          completado_en: new Date(),
        },
        update: {
          estado: 'Completada',
          completado_en: previousProgress?.estado === 'Completada' ? undefined : new Date(),
        },
      });

      const courseLessonIds = course.modulos.flatMap((module) =>
        module.lecciones.map((item) => item.leccion_id),
      );

      const completedRows = await tx.progresoLeccion.findMany({
        where: {
          usuario_id: params.usuarioId,
          leccion_id: { in: courseLessonIds },
          estado: 'Completada',
        },
        select: { leccion_id: true },
      });

      const completedLessonIds = new Set(
        completedRows.map((item) => item.leccion_id),
      );
      const courseProgress = clampPercent(
        courseLessonIds.length > 0
          ? (completedLessonIds.size / courseLessonIds.length) * 100
          : 0,
      );
      const courseCompleted =
        courseLessonIds.length > 0 && courseProgress === 100;

      await tx.inscripcionesCurso.upsert({
        where: {
          usuario_id_curso_id: {
            usuario_id: params.usuarioId,
            curso_id: course.curso_id,
          },
        },
        create: {
          usuario_id: params.usuarioId,
          curso_id: course.curso_id,
          estado: courseCompleted ? 'Completado' : 'En_progreso',
          progreso_porcentaje: courseProgress,
          fecha_completado: courseCompleted ? new Date() : null,
        },
        update: {
          estado: courseCompleted ? 'Completado' : 'En_progreso',
          progreso_porcentaje: courseProgress,
          fecha_completado: courseCompleted
            ? previousProgress?.estado === 'Completada'
              ? undefined
              : new Date()
            : null,
        },
      });

      const lessonMappings = course.modulos.flatMap((module) =>
        module.lecciones.flatMap((item) =>
          item.leccion_habilidades.map((mapping) => ({
            lessonId: item.leccion_id,
            skillId: mapping.habilidad_id,
            weight: mapping.peso,
          })),
        ),
      );
      const courseSkillIds = [
        ...course.curso_habilidades.map((item) => item.habilidad_id),
        ...(course.habilidad_principal ? [course.habilidad_principal] : []),
      ];

      await updateSkillProgress(
        tx,
        params.usuarioId,
        getCourseSkillProgress({
          lessonMappings,
          courseSkillIds,
          completedLessonIds,
          courseProgress,
        }),
      );

      if (courseCompleted) {
        await tx.planAccion.updateMany({
          where: {
            usuario_id: params.usuarioId,
            curso_vinculado_id: course.curso_id,
          },
          data: {
            completado: true,
            estado: 'completed',
            actualizado_en: new Date(),
          },
        });
      }

      const matchAfter = await getUserSkillsMatch(tx, params.usuarioId);
      const completedModule = course.modulos.find(
        (module) =>
          module.modulo_id === lesson.modulo.modulo_id &&
          module.lecciones.length > 0 &&
          module.lecciones.every((item) =>
            completedLessonIds.has(item.leccion_id),
          ),
      );

      await tx.historialProgreso.createMany({
        data: [
          {
            usuario_id: params.usuarioId,
            tipo_evento: 'Leccion',
            entidad_id: lesson.leccion_id,
            titulo: lesson.titulo,
            match_anterior: matchBefore,
            match_nuevo: matchAfter,
            metadatos: {
              curso_id: course.curso_id,
              modulo_id: lesson.modulo.modulo_id,
            },
          },
          ...(completedModule
            ? [
                {
                  usuario_id: params.usuarioId,
                  tipo_evento: 'Modulo' as const,
                  entidad_id: completedModule.modulo_id,
                  titulo: completedModule.titulo,
                  match_anterior: matchAfter,
                  match_nuevo: matchAfter,
                  metadatos: { curso_id: course.curso_id },
                },
              ]
            : []),
          ...(courseCompleted
            ? [
                {
                  usuario_id: params.usuarioId,
                  tipo_evento: 'Curso' as const,
                  entidad_id: course.curso_id,
                  titulo: course.titulo,
                  match_anterior: matchAfter,
                  match_nuevo: matchAfter,
                  metadatos: {},
                },
              ]
            : []),
        ],
        skipDuplicates: true,
      });

      return {
        alreadyCompleted: previousProgress?.estado === 'Completada',
        lessonId: lesson.leccion_id,
        moduleCompleted: Boolean(completedModule),
        courseCompleted,
        courseProgress,
        matchBefore,
        matchAfter,
      };
        },
        {
          isolationLevel: 'Serializable',
          maxWait: 10_000,
          timeout: 20_000,
        },
      );
    } catch (error) {
      lastError = error;

      if (
        !(error instanceof Prisma.PrismaClientKnownRequestError) ||
        error.code !== 'P2034'
      ) {
        throw error;
      }
    }
  }

  throw lastError;
}
