import { NextResponse } from 'next/server';
import { onboardingSchema } from '@appbit/shared-schemas';
import { dbClient } from '../../../server/clients/db.client';
import type { NivelIdiomaEnum } from '../../../server/generated/prisma';

const NIVEL_IDIOMA_MAP: Record<string, NivelIdiomaEnum> = {
  A1: 'A1_Basico' as NivelIdiomaEnum,
  A2: 'A2_Elemental' as NivelIdiomaEnum,
  B1: 'B1_Intermedio' as NivelIdiomaEnum,
  B2: 'B2_Avanzado' as NivelIdiomaEnum,
  C1: 'C1_Fluido' as NivelIdiomaEnum,
};

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const rawBody: Record<string, unknown> = await request.json();
    const authUid = rawBody.authUid as string | undefined;
    const email = rawBody.email as string | undefined;
    const nombreCompleto = rawBody.nombreCompleto as string | undefined;

    const parsed = onboardingSchema.safeParse(rawBody);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, message: 'Datos inválidos', errors: parsed.error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    const data = parsed.data;

    const result = await dbClient.$transaction(async (tx) => {
      let usuario;
      if (authUid) {
        usuario = await tx.usuarios.findUnique({ where: { auth_uid: authUid } });
      }
      if (!usuario && email) {
        usuario = await tx.usuarios.findUnique({ where: { email } });
      }

      const baseData = {
        fecha_nacimiento: new Date(data.fechaNacimiento),
        genero: data.genero,
        pais: data.pais,
        provincia_estado: data.provinciaEstado ?? null,
        ciudad: data.ciudad,
        zona_residencia: data.zonaResidencia ?? null,
        tipo_conexion: data.tipoConexion,
        whatsapp_codigo: data.whatsappCodigo ?? null,
        whatsapp_numero: data.whatsappNumero ?? null,
        onboarding_status: 'COMPLETED' as const,
      };

      if (usuario) {
        usuario = await tx.usuarios.update({
          where: { usuario_id: usuario.usuario_id },
          data: { ...baseData, nombre_completo: nombreCompleto ?? usuario.nombre_completo },
        });
      } else {
        usuario = await tx.usuarios.create({
          data: {
            ...baseData,
            auth_uid: authUid ?? null,
            email: email ?? 'unknown@email.com',
            nombre_completo: nombreCompleto ?? 'Usuario',
          },
        });
      }

      const usuarioId = usuario.usuario_id;

      await tx.usuarioNivelEducacion.deleteMany({ where: { usuario_id: usuarioId } });
      if (data.nivelEducacion.length > 0) {
        await tx.usuarioNivelEducacion.createMany({
          data: data.nivelEducacion.map((nivel) => ({ usuario_id: usuarioId, nivel_educacion: nivel })),
        });
      }

      await tx.usuarioMomentoProfesional.deleteMany({ where: { usuario_id: usuarioId } });
      if (data.momentoProfesional.length > 0) {
        await tx.usuarioMomentoProfesional.createMany({
          data: data.momentoProfesional.map((momento) => ({ usuario_id: usuarioId, momento_profesional: momento })),
        });
      }

      await tx.usuarioAreasInteres.deleteMany({ where: { usuario_id: usuarioId } });
      if (data.areasInteres.length > 0) {
        await tx.usuarioAreasInteres.createMany({
          data: data.areasInteres.map((area) => ({ usuario_id: usuarioId, area })),
        });
      }

      await tx.usuarioIdiomas.deleteMany({ where: { usuario_id: usuarioId } });
      if (data.idiomas.length > 0) {
        await tx.usuarioIdiomas.createMany({
          data: data.idiomas.map(({ idioma, nivel }) => ({
            usuario_id: usuarioId,
            idioma,
            nivel: NIVEL_IDIOMA_MAP[nivel] ?? nivel,
          })),
        });
      }

      await tx.usuarioDisponibilidad.deleteMany({ where: { usuario_id: usuarioId } });
      if (data.disponibilidad.length > 0) {
        await tx.usuarioDisponibilidad.createMany({
          data: data.disponibilidad.map((disp) => ({ usuario_id: usuarioId, disponibilidad: disp })),
        });
      }

      await tx.usuarioUbicacionTrabajo.deleteMany({ where: { usuario_id: usuarioId } });
      await tx.usuarioUbicacionTrabajo.create({
        data: { usuario_id: usuarioId, ubicacion: data.ubicacionTrabajo },
      });

      await tx.usuarioObjetivos.deleteMany({ where: { usuario_id: usuarioId } });
      if (data.objetivos.length > 0) {
        await tx.usuarioObjetivos.createMany({
          data: data.objetivos.map((objetivo) => ({ usuario_id: usuarioId, objetivo })),
        });
      }

      await tx.usuarioDispositivos.deleteMany({ where: { usuario_id: usuarioId } });
      if (data.dispositivos.length > 0) {
        await tx.usuarioDispositivos.createMany({
          data: data.dispositivos.map((dispositivo) => ({ usuario_id: usuarioId, dispositivo })),
        });
      }

      const perfilMovilidad = await tx.perfilMovilidad.findFirst({
        where: { usuario_id: null },
      });
      if (perfilMovilidad) {
        await tx.perfilMovilidad.update({
          where: { id: perfilMovilidad.id },
          data: { usuario_id: usuarioId },
        });
      }

      return { usuarioId, onboardingCompleted: true };
    });

    const aiServiceUrl = process.env.AI_SERVICE_URL;
    if (aiServiceUrl) {
      try {
        await fetch(`${aiServiceUrl}/api/onboarding`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ usuarioId: result.usuarioId, ...data }),
          signal: AbortSignal.timeout(10000),
        });
      } catch {
        console.warn('ai-service no disponible, onboarding completado sin recomendaciones');
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Onboarding completado exitosamente',
      userId: result.usuarioId,
      nextPath: '/dashboard',
    });
  } catch (error) {
    console.error('Error en onboarding:', error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Error interno del servidor',
      },
      { status: 500 },
    );
  }
}
