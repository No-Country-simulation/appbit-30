import { NextResponse } from 'next/server';
import { getCurrentAuthUser } from '@/src/server/auth/get-current-auth-user';
import { findLinkedUsuario } from '@/src/server/auth/find-linked-usuario';
import {
  apiErrorResponse,
  getRequestId,
  logApiError,
} from '@/src/server/api/api-error';
import {
  LearningPathRegenerationError,
  regenerateLearningPath,
} from '@/src/features/formacion/server/regenerate-learning-path';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const requestId = getRequestId(request);

  try {
    const authUser = await getCurrentAuthUser();

    if (!authUser) {
      return apiErrorResponse({
        status: 401,
        code: 'UNAUTHORIZED',
        message: 'Necesitás iniciar sesión para actualizar tu plan.',
        requestId,
      });
    }

    const usuario = await findLinkedUsuario(authUser, {
      usuario_id: true,
      idioma_app: true,
    });

    if (!usuario) {
      return apiErrorResponse({
        status: 404,
        code: 'USER_NOT_FOUND',
        message: 'No encontramos tu perfil de usuario.',
        requestId,
      });
    }

    const result = await regenerateLearningPath({
      usuarioId: usuario.usuario_id,
      locale: usuario.idioma_app,
      requestId,
    });

    return NextResponse.json({
      success: true,
      message: 'Plan actualizado correctamente.',
      planAccionCount: result.planAccionCount ?? 0,
      requestId,
    });
  } catch (error) {
    if (error instanceof LearningPathRegenerationError) {
      return apiErrorResponse({
        status: error.code === 'PROFILE_INCOMPLETE' ? 409 : 503,
        code: error.code,
        message: error.message,
        requestId,
      });
    }

    logApiError({
      route: 'POST /api/formacion/plan/regenerar',
      requestId,
      error,
    });

    return apiErrorResponse({
      status: 500,
      code: 'LEARNING_PATH_REGENERATION_FAILED',
      message: 'No pudimos actualizar tu plan. Intentá de nuevo.',
      requestId,
    });
  }
}
