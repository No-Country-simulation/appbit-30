import { createPostulacionSchema } from '@appbit/shared-schemas';
import { NextResponse } from 'next/server';
import {
  calculateVacanteMatch,
} from '@/src/features/empleabilidad/server/employability.service';
import { listPostulaciones } from '@/src/features/empleabilidad/server/postulaciones.service';
import { getAuthenticatedUsuarioId } from '@/src/server/auth/get-authenticated-usuario-id';
import { dbClient } from '@/src/server/clients/db.client';
import { Prisma } from '@/src/server/generated/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const auth = await getAuthenticatedUsuarioId();
    if ('error' in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    return NextResponse.json({ data: await listPostulaciones(auth.usuarioId) });
  } catch (error) {
    console.error('Error fetching applications:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const auth = await getAuthenticatedUsuarioId();
    if ('error' in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    let rawBody: unknown;
    try {
      rawBody = await request.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 422 });
    }

    const parsed = createPostulacionSchema.safeParse(rawBody);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request body', issues: parsed.error.issues },
        { status: 422 },
      );
    }

    const vacancy = await calculateVacanteMatch(
      auth.usuarioId,
      parsed.data.vacante_id,
    );
    if (!vacancy) {
      return NextResponse.json({ error: 'Vacancy not found' }, { status: 404 });
    }

    const postulacion = await dbClient.postulaciones.create({
      data: {
        usuario_id: auth.usuarioId,
        vacante_id: parsed.data.vacante_id,
        mensaje_motivacion: parsed.data.mensaje_motivacion ?? null,
        usar_cv_guardado: parsed.data.usar_cv_guardado,
        match_porcentaje: vacancy.match,
      },
      select: { postulacion_id: true },
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Postulación creada correctamente',
        postulacionId: postulacion.postulacion_id,
      },
      { status: 201 },
    );
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      return NextResponse.json(
        { error: 'Application already exists' },
        { status: 409 },
      );
    }

    console.error('Error creating application:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
