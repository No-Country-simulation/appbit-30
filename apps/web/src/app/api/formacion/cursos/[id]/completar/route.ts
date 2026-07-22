import { NextResponse } from 'next/server';
import { getCurrentAuthUser } from '@/src/server/auth/get-current-auth-user';
import { findLinkedUsuario } from '@/src/server/auth/find-linked-usuario';
import {
  apiErrorResponse,
  getRequestId,
  logApiError,
} from '@/src/server/api/api-error';
import {
  completeExternalCourse,
  CourseCompletionError,
} from '@/src/features/formacion/server/complete-course';

export const dynamic = 'force-dynamic';

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const requestId = getRequestId(request);
  const { id } = await context.params;

  if (!UUID_PATTERN.test(id)) {
    return apiErrorResponse({
      status: 422,
      code: 'INVALID_COURSE_ID',
      message: 'El identificador del curso no es válido.',
      requestId,
    });
  }

  try {
    const authUser = await getCurrentAuthUser();

    if (!authUser) {
      return apiErrorResponse({
        status: 401,
        code: 'UNAUTHORIZED',
        message: 'Necesitás iniciar sesión para registrar tu progreso.',
        requestId,
      });
    }

    const usuario = await findLinkedUsuario(authUser, { usuario_id: true });

    if (!usuario) {
      return apiErrorResponse({
        status: 404,
        code: 'USER_NOT_FOUND',
        message: 'No encontramos tu perfil de usuario.',
        requestId,
      });
    }

    const result = await completeExternalCourse({
      usuarioId: usuario.usuario_id,
      cursoId: id,
    });

    return NextResponse.json({
      success: true,
      message: result.alreadyCompleted
        ? 'El curso ya estaba completado.'
        : 'Curso completado correctamente.',
      ...result,
      requestId,
    });
  } catch (error) {
    if (error instanceof CourseCompletionError) {
      const status =
        error.code === 'COURSE_NOT_FOUND'
          ? 404
          : error.code === 'COURSE_INACTIVE'
            ? 409
            : 422;

      return apiErrorResponse({
        status,
        code: error.code,
        message: error.message,
        requestId,
      });
    }

    logApiError({
      route: 'PATCH /api/formacion/cursos/[id]/completar',
      requestId,
      error,
      context: { courseId: id },
    });

    return apiErrorResponse({
      status: 500,
      code: 'COURSE_COMPLETION_FAILED',
      message: 'No pudimos guardar tu progreso. Intentá de nuevo.',
      requestId,
    });
  }
}
