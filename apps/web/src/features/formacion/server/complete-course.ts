import { dbClient } from '@/src/server/clients/db.client';
import { Prisma } from '@/src/server/generated/prisma';
import { getUserSkillsMatch } from '@/src/server/progress/skill-progress';

export class CourseCompletionError extends Error {
  constructor(
    readonly code:
      | 'COURSE_NOT_FOUND'
      | 'COURSE_INACTIVE'
      | 'INTERNAL_COURSE_REQUIRES_LESSONS',
    message: string,
  ) {
    super(message);
    this.name = 'CourseCompletionError';
  }
}

const EXTERNAL_CONTENT_TYPES = new Set(['Curso_externo', 'Roadmap_externo']);

export async function completeExternalCourse(params: {
  usuarioId: string;
  cursoId: string;
}) {
  let lastError: unknown;

  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      return await dbClient.$transaction(
        async (tx) => {
          const course = await tx.cursos.findUnique({
            where: { curso_id: params.cursoId },
            select: {
              curso_id: true,
              titulo: true,
              activo: true,
              tipo_contenido: true,
              habilidad_principal: true,
              curso_habilidades: {
                select: { habilidad_id: true },
              },
              inscripciones: {
                where: { usuario_id: params.usuarioId },
                take: 1,
                select: { estado: true, progreso_porcentaje: true },
              },
            },
          });

          if (!course) {
            throw new CourseCompletionError(
              'COURSE_NOT_FOUND',
              'No encontramos el curso solicitado.',
            );
          }

          if (!course.activo) {
            throw new CourseCompletionError(
              'COURSE_INACTIVE',
              'El curso ya no está disponible.',
            );
          }

          if (!EXTERNAL_CONTENT_TYPES.has(course.tipo_contenido)) {
            throw new CourseCompletionError(
              'INTERNAL_COURSE_REQUIRES_LESSONS',
              'Completá las lecciones del curso para registrar el progreso.',
            );
          }

          const alreadyCompleted =
            course.inscripciones[0]?.estado === 'Completado' &&
            course.inscripciones[0]?.progreso_porcentaje === 100;
          const matchBefore = await getUserSkillsMatch(tx, params.usuarioId);

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
              estado: 'Completado',
              progreso_porcentaje: 100,
              fecha_completado: new Date(),
            },
            update: {
              estado: 'Completado',
              progreso_porcentaje: 100,
              fecha_completado: alreadyCompleted ? undefined : new Date(),
            },
          });

          const skillIds = new Set([
            ...course.curso_habilidades.map((item) => item.habilidad_id),
            ...(course.habilidad_principal
              ? [course.habilidad_principal]
              : []),
          ]);

          for (const skillId of skillIds) {
            await tx.usuarioHabilidades.upsert({
              where: {
                usuario_id_habilidad_id: {
                  usuario_id: params.usuarioId,
                  habilidad_id: skillId,
                },
              },
              create: {
                usuario_id: params.usuarioId,
                habilidad_id: skillId,
                estado: 'Adquirida',
                progreso_porcentaje: 100,
              },
              update: {
                estado: 'Adquirida',
                progreso_porcentaje: 100,
                actualizado_en: new Date(),
              },
            });
          }

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

          const matchAfter = await getUserSkillsMatch(tx, params.usuarioId);

          await tx.historialProgreso.createMany({
            data: [
              {
                usuario_id: params.usuarioId,
                tipo_evento: 'Curso',
                entidad_id: course.curso_id,
                titulo: course.titulo,
                match_anterior: matchBefore,
                match_nuevo: matchAfter,
                metadatos: { origen: 'curso_externo' },
              },
            ],
            skipDuplicates: true,
          });

          return {
            alreadyCompleted,
            courseId: course.curso_id,
            courseCompleted: true,
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
