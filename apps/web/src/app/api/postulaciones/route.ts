import { NextResponse } from 'next/server';
import { postulacionRequestSchema } from '@appbit/shared-schemas';
import { dbClient } from '@/src/server/clients/db.client';
import { getCurrentAuthUser } from '@/src/server/auth/get-current-auth-user';
import { findLinkedUsuario } from '@/src/server/auth/find-linked-usuario';
import { Prisma } from '@/src/server/generated/prisma';

export const dynamic = 'force-dynamic';

const postulacionUsuarioSelect = {
  usuario_id: true,
} as const;

function formatDate(date: Date): string {
  return date.toLocaleDateString('es-AR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function calcularMatchPorcentaje(
  requisitos: { habilidad_id: string }[],
  userSkills: { habilidad_id: string }[],
): number {
  if (requisitos.length === 0) return 0;
  const userSkillIds = new Set(userSkills.map((s) => s.habilidad_id));
  const matches = requisitos.filter((r) => userSkillIds.has(r.habilidad_id)).length;
  return Math.round((matches / requisitos.length) * 100);
}

const estadoLabels: Record<string, string> = {
  Enviada: 'Enviada',
  Vista: 'Vista',
  En_proceso: 'En revisión',
  Rechazada: 'Rechazada',
  Aceptada: 'Aceptada',
};

export async function GET() {
  try {
    const authUser = await getCurrentAuthUser();

    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const usuario = await findLinkedUsuario(authUser, postulacionUsuarioSelect);

    if (!usuario) {
      return NextResponse.json(
        { error: 'User not found. Complete onboarding first.' },
        { status: 404 },
      );
    }

    const postulaciones = await dbClient.postulaciones.findMany({
      where: { usuario_id: usuario.usuario_id },
      include: {
        vacante: {
          include: {
            empresa: {
              select: {
                nombre: true,
                logo_url: true,
              },
            },
          },
        },
      },
      orderBy: { creado_en: 'desc' },
    });

    const formatted = postulaciones.map((p) => ({
      id: p.postulacion_id,
      titulo: p.vacante.titulo,
      empresa: p.vacante.empresa.nombre,
      logoUrl: p.vacante.empresa.logo_url,
      estado: estadoLabels[p.estado] ?? p.estado,
      matchPorcentaje: p.match_porcentaje ? Number(p.match_porcentaje) : null,
      feedback: null,
      skillRechazada: null,
      mensajesNuevos: 0,
      creadoEn: formatDate(p.creado_en),
    }));

    return NextResponse.json({ postulaciones: formatted });
  } catch (error) {
    console.error('Error fetching postulaciones:', error);

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const authUser = await getCurrentAuthUser();

    if (!authUser) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 },
      );
    }

    const rawBody = await request.json();
    const parsed = postulacionRequestSchema.safeParse(rawBody);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          message: 'Datos inválidos',
          errors: parsed.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    const usuario = await findLinkedUsuario(authUser, postulacionUsuarioSelect);

    if (!usuario) {
      return NextResponse.json(
        {
          success: false,
          message: 'Usuario no encontrado. Complete onboarding first.',
        },
        { status: 404 },
      );
    }

    const { vacante_id, mensaje_motivacion, usar_cv_guardado } = parsed.data;

    const vacante = await dbClient.vacantes.findUnique({
      where: { vacante_id },
      select: {
        activa: true,
        requisitos: {
          select: { habilidad_id: true },
        },
      },
    });

    if (!vacante) {
      return NextResponse.json(
        { success: false, message: 'Vacante no encontrada' },
        { status: 404 },
      );
    }

    if (!vacante.activa) {
      return NextResponse.json(
        { success: false, message: 'La vacante ya no está activa' },
        { status: 400 },
      );
    }

    const existing = await dbClient.postulaciones.findUnique({
      where: {
        usuario_id_vacante_id: {
          usuario_id: usuario.usuario_id,
          vacante_id,
        },
      },
    });

    if (existing) {
      return NextResponse.json(
        { success: false, message: 'Ya te postulaste a esta vacante' },
        { status: 409 },
      );
    }

    const userSkills = await dbClient.usuarioHabilidades.findMany({
      where: { usuario_id: usuario.usuario_id },
      select: { habilidad_id: true },
    });

    const matchPorcentaje = calcularMatchPorcentaje(vacante.requisitos, userSkills);

    const result = await dbClient.postulaciones.create({
      data: {
        usuario_id: usuario.usuario_id,
        vacante_id,
        mensaje_motivacion: mensaje_motivacion ?? null,
        usar_cv_guardado,
        match_porcentaje: new Prisma.Decimal(matchPorcentaje),
        estado: 'Enviada',
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Postulación enviada con éxito',
      postulacionId: result.postulacion_id,
    });
  } catch (error) {
    console.error('Error creating postulacion:', error);

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error ? error.message : 'Error interno del servidor',
      },
      { status: 500 },
    );
  }
}
