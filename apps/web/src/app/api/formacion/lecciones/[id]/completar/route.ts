import { NextResponse } from 'next/server';
import { getCurrentAuthUser } from '@/src/server/auth/get-current-auth-user';
import { findLinkedUsuario } from '@/src/server/auth/find-linked-usuario';
import {
  apiErrorResponse,
  getRequestId,
  logApiError,
} from '@/src/server/api/api-error';
import {
  completeLesson,
  LearningProgressError,
} from '@/src/features/formacion/server/complete-lesson';

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
      code: 'INVALID_LESSON_ID',
      message: 'El identificador de la lección no es válido.',
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

    const result = await completeLesson({
      usuarioId: usuario.usuario_id,
      leccionId: id,
    });

    return NextResponse.json({
      success: true,
      message: result.alreadyCompleted
        ? 'La lección ya estaba completada.'
        : 'Lección completada correctamente.',
      ...result,
      requestId,
    });
  } catch (error) {
    if (error instanceof LearningProgressError) {
      return apiErrorResponse({
        status: error.code === 'LESSON_NOT_FOUND' ? 404 : 409,
        code: error.code,
        message: error.message,
        requestId,
      });
    }

    logApiError({
      route: 'PATCH /api/formacion/lecciones/[id]/completar',
      requestId,
      error,
      context: { lessonId: id },
    });

    return apiErrorResponse({
      status: 500,
      code: 'LEARNING_PROGRESS_FAILED',
      message: 'No pudimos guardar tu progreso. Intentá de nuevo.',
      requestId,
    });
  }
}
