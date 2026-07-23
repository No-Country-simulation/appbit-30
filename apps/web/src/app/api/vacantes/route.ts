import { NextResponse } from 'next/server';
import {
  AREA_VALUES,
  listVacantes,
  MODALIDAD_VALUES,
} from '@/src/features/empleabilidad/server/employability.service';
import { getAuthenticatedUsuarioId } from '@/src/server/auth/get-authenticated-usuario-id';
import type {
  AreaInteresEnum,
  ModalidadVacanteEnum,
} from '@/src/server/generated/prisma';

export const dynamic = 'force-dynamic';

const MAX_LIMIT = 100;

function positiveInteger(value: string | null, fallback: number) {
  if (value === null) return fallback;
  if (!/^\d+$/.test(value) || Number(value) < 1) return null;
  return Number(value);
}

export async function GET(request: Request) {
  try {
    const auth = await getAuthenticatedUsuarioId();
    if ('error' in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const params = new URL(request.url).searchParams;
    const area = params.get('area');
    const modalidad = params.get('modalidad');
    const search = params.get('search')?.trim();
    const page = positiveInteger(params.get('page'), 1);
    const limit = positiveInteger(params.get('limit'), 20);

    if (
      (area && !AREA_VALUES.includes(area as AreaInteresEnum)) ||
      (modalidad &&
        !MODALIDAD_VALUES.includes(modalidad as ModalidadVacanteEnum)) ||
      page === null ||
      limit === null ||
      limit > MAX_LIMIT ||
      (search?.length ?? 0) > 200
    ) {
      return NextResponse.json(
        { error: 'Invalid query parameters' },
        { status: 422 },
      );
    }

    const result = await listVacantes(auth.usuarioId, {
      area: area as AreaInteresEnum | undefined,
      modalidad: modalidad as ModalidadVacanteEnum | undefined,
      search,
      page,
      limit,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching vacancies:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
