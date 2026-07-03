import { NextResponse } from 'next/server';
import { dbClient } from '@/src/server/clients/db.client';
import { getCurrentAuthUser } from '@/src/server/auth/get-current-auth-user';
import { postulacionRequestSchema } from '@appbit/shared-schemas';

const DEV_USER_ID = '003f7b4f-364b-4fa0-b921-2452393769d6';

export const dynamic = 'force-dynamic';

async function getUserId() {
  const authUser = await getCurrentAuthUser();
  if (authUser) {
    const usuario = await dbClient.usuarios.findUnique({
      where: { auth_uid: authUser.id },
      select: { usuario_id: true },
    });
    if (usuario) return { userId: usuario.usuario_id };
  }
  const devUser = await dbClient.usuarios.findUnique({
    where: { usuario_id: DEV_USER_ID },
    select: { usuario_id: true },
  });
  if (devUser) return { userId: devUser.usuario_id };
  return { userId: null, error: NextResponse.json({ error: 'User not found' }, { status: 404 }) };
}

export async function GET() {
  try {
    const { userId, error } = await getUserId();
    if (error) return error;

    const postulaciones = await dbClient.postulaciones.findMany({
      where: { usuario_id: userId },
      include: {
        vacante: {
          select: {
            vacante_id: true, titulo: true, area: true, nivel: true, modalidad: true,
            empresa: { select: { nombre: true, logo_url: true } },
          },
        },
      },
      orderBy: { creado_en: 'desc' },
    });

    return NextResponse.json({
      postulaciones: postulaciones.map((p) => ({
        postulacion_id: p.postulacion_id,
        estado: p.estado,
        match_porcentaje: p.match_porcentaje ? Number(p.match_porcentaje) : null,
        mensaje_motivacion: p.mensaje_motivacion,
        usar_cv_guardado: p.usar_cv_guardado,
        cv_url: p.cv_url,
        creado_en: p.creado_en,
        vacante: p.vacante,
      })),
      total: postulaciones.length,
    });
  } catch (error) {
    console.error('Error fetching postulaciones:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { userId, error } = await getUserId();
    if (error) return error;

    const body = await request.json();
    const parsed = postulacionRequestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: parsed.error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    const { vacante_id, mensaje_motivacion, usar_cv_guardado, cv_url } = parsed.data;

    const vacante = await dbClient.vacantes.findUnique({
      where: { vacante_id },
      select: { vacante_id: true, activa: true },
    });
    if (!vacante || !vacante.activa) {
      return NextResponse.json({ error: 'Vacante no encontrada o inactiva' }, { status: 404 });
    }

    const existing = await dbClient.postulaciones.findUnique({
      where: { usuario_id_vacante_id: { usuario_id: userId, vacante_id } },
    });
    if (existing) {
      return NextResponse.json({ error: 'Ya te postulaste a esta vacante' }, { status: 409 });
    }

    const requisitos = await dbClient.requisitosVacante.findMany({
      where: { vacante_id },
      select: { habilidad_id: true },
    });

    let matchPorcentaje = null;
    if (requisitos.length > 0) {
      const userSkills = await dbClient.usuarioHabilidades.findMany({
        where: { usuario_id: userId, estado: 'Adquirida' },
        select: { habilidad_id: true },
      });
      const userSkillIds = new Set(userSkills.map((s) => s.habilidad_id));
      const matches = requisitos.filter((r) => userSkillIds.has(r.habilidad_id)).length;
      matchPorcentaje = Math.round((matches / requisitos.length) * 100);
    }

    const postulacion = await dbClient.postulaciones.create({
      data: {
        usuario_id: userId,
        vacante_id,
        mensaje_motivacion: mensaje_motivacion ?? null,
        usar_cv_guardado,
        cv_url: cv_url ?? null,
        match_porcentaje: matchPorcentaje,
      },
    });

    return NextResponse.json(
      {
        success: true,
        postulacion_id: postulacion.postulacion_id,
        match_porcentaje: matchPorcentaje,
        mensaje: 'Postulación creada exitosamente',
      },
      { status: 201 },
    );
  } catch (error) {
    console.error('Error creating postulacion:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
