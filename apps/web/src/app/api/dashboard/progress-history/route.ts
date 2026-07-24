import { NextResponse } from 'next/server';
import { dbClient } from '@/src/server/clients/db.client';
import { getCurrentAuthUser } from '@/src/server/auth/get-current-auth-user';
import { findLinkedUsuario } from '@/src/server/auth/find-linked-usuario';
import {
  apiErrorResponse,
  getRequestId,
  logApiError,
} from '@/src/server/api/api-error';
import { getProgressHistory } from '@/src/features/dashboard/server/progress-history';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const requestId = getRequestId(request);
  const rawMonths = new URL(request.url).searchParams.get('months') ?? '4';
  const months = Number(rawMonths);

  if (!Number.isInteger(months) || months < 1 || months > 12) {
    return apiErrorResponse({
      status: 422,
      code: 'INVALID_MONTHS',
      message: 'El rango debe ser un número entero entre 1 y 12 meses.',
      requestId,
    });
  }

  try {
    const authUser = await getCurrentAuthUser();

    if (!authUser) {
      return apiErrorResponse({
        status: 401,
        code: 'UNAUTHORIZED',
        message: 'Necesitás iniciar sesión para ver tu historial.',
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

    const history = await getProgressHistory({
      client: dbClient,
      usuarioId: usuario.usuario_id,
      months,
      includeEvents: true,
    });

    return NextResponse.json({
      success: true,
      requestId,
      ...history,
    });
  } catch (error) {
    logApiError({
      route: 'GET /api/dashboard/progress-history',
      requestId,
      error,
    });

    return apiErrorResponse({
      status: 500,
      code: 'PROGRESS_HISTORY_FAILED',
      message: 'No pudimos cargar tu historial. Intentá de nuevo.',
      requestId,
    });
  }
}
