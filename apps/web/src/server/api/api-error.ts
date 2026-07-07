import { randomUUID } from 'node:crypto';
import { NextResponse } from 'next/server';

type ErrorDetails = Record<string, unknown>;

interface ApiErrorResponseParams {
  status: number;
  code: string;
  message: string;
  requestId: string;
  details?: ErrorDetails;
}

interface LogApiErrorParams {
  route: string;
  requestId: string;
  error: unknown;
  context?: ErrorDetails;
}

interface ZodLikeIssue {
  path: readonly PropertyKey[];
  message: string;
  code?: string;
}

interface ZodLikeError {
  issues: readonly ZodLikeIssue[];
}

export function getRequestId(request: Request) {
  return (
    request.headers.get('x-request-id') ||
    request.headers.get('x-vercel-id') ||
    randomUUID()
  );
}

export function apiErrorResponse({
  status,
  code,
  message,
  requestId,
  details,
}: ApiErrorResponseParams) {
  const response = NextResponse.json(
    {
      success: false,
      code,
      message,
      requestId,
      ...(details ? details : {}),
    },
    { status },
  );

  response.headers.set('x-request-id', requestId);

  return response;
}

function serializeError(error: unknown) {
  if (error instanceof Error) {
    const errorWithExtra = error as Error & {
      code?: string;
      meta?: unknown;
      clientVersion?: string;
      digest?: string;
    };

    return {
      name: error.name,
      message: error.message,
      stack: error.stack,
      code: errorWithExtra.code,
      meta: errorWithExtra.meta,
      clientVersion: errorWithExtra.clientVersion,
      digest: errorWithExtra.digest,
    };
  }

  if (error && typeof error === 'object') {
    return error;
  }

  return {
    message: String(error),
  };
}

export function logApiError({
  route,
  requestId,
  error,
  context,
}: LogApiErrorParams) {
  console.error(
    JSON.stringify({
      level: 'error',
      route,
      requestId,
      timestamp: new Date().toISOString(),
      error: serializeError(error),
      context,
    }),
  );
}

function humanizeZodIssue(issue: ZodLikeIssue, label: string) {
  const message = issue.message || 'Campo inválido';

  if (
    message === 'Required' ||
    message.toLowerCase().includes('required') ||
    message.toLowerCase().includes('received undefined')
  ) {
    return `${label}: campo obligatorio.`;
  }

  if (issue.code === 'invalid_type') {
    return `${label}: tipo de dato inválido.`;
  }

  if (issue.code === 'invalid_enum_value') {
    return `${label}: opción inválida.`;
  }

  if (issue.code === 'too_small') {
    return `${label}: falta completar este campo.`;
  }

  if (issue.code === 'too_big') {
    return `${label}: supera el máximo permitido.`;
  }

  return `${label}: ${message}`;
}

function formatIssuePath(path: readonly PropertyKey[]) {
  const normalizedPath = path
    .map((part) => {
      if (typeof part === 'symbol') {
        return part.description || part.toString();
      }

      return String(part);
    })
    .filter(Boolean)
    .join('.');

  return normalizedPath || '_form';
}

export function formatZodFieldErrors(
  error: ZodLikeError,
  labels: Record<string, string> = {},
) {
  const fieldErrors: Record<string, string[]> = {};

  for (const issue of error.issues) {
    const path = formatIssuePath(issue.path);
    const label = labels[path] ?? path;

    fieldErrors[path] ??= [];
    fieldErrors[path].push(humanizeZodIssue(issue, label));
  }

  return fieldErrors;
}
