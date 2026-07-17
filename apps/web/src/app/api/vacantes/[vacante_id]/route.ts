import { NextResponse } from 'next/server';
import { getVacanteById } from '@/src/features/empleabilidad/server/employability.service';
import { getAuthenticatedUsuarioId } from '@/src/features/empleabilidad/server/get-authenticated-usuario';

export const dynamic = 'force-dynamic';

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

type Context = { params: Promise<{ vacante_id: string }> };

export async function GET(_request: Request, { params }: Context) {
  try {
    const auth = await getAuthenticatedUsuarioId();
    if ('error' in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { vacante_id: vacanteId } = await params;
    if (!UUID_PATTERN.test(vacanteId)) {
      return NextResponse.json({ error: 'Invalid vacancy id' }, { status: 422 });
    }

    const vacante = await getVacanteById(auth.usuarioId, vacanteId);
    if (!vacante) {
      return NextResponse.json({ error: 'Vacancy not found' }, { status: 404 });
    }

    return NextResponse.json({ data: vacante });
  } catch (error) {
    console.error('Error fetching vacancy:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
