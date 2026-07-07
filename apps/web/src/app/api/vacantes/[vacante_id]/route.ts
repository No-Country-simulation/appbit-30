import { NextResponse } from 'next/server';
import { dbClient } from '@/src/server/clients/db.client';
import { getCurrentAuthUser } from '@/src/server/auth/get-current-auth-user';
import { findLinkedUsuario } from '@/src/server/auth/find-linked-usuario';

export const dynamic = 'force-dynamic';

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

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ vacante_id: string }> },
) {
  try {
    const { vacante_id } = await params;

    const authUser = await getCurrentAuthUser();

    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const usuario = await findLinkedUsuario(authUser, {
      usuario_id: true,
    });

    if (!usuario) {
      return NextResponse.json(
        { error: 'User not found. Complete onboarding first.' },
        { status: 404 },
      );
    }

    const userId = usuario.usuario_id;

    const [vacante, userSkills] = await Promise.all([
      dbClient.vacantes.findUnique({
        where: { vacante_id },
        include: {
          empresa: {
            select: {
              nombre: true,
              logo_url: true,
              descripcion: true,
              sector: true,
              tamanio: true,
            },
          },
          requisitos: {
            include: {
              habilidad: {
                select: {
                  habilidad_id: true,
                  nombre: true,
                },
              },
            },
          },
        },
      }),
      dbClient.usuarioHabilidades.findMany({
        where: { usuario_id: userId },
        select: { habilidad_id: true },
      }),
    ]);

    if (!vacante) {
      return NextResponse.json(
        { error: 'Vacante not found' },
        { status: 404 },
      );
    }

    const matchPorcentaje = calcularMatchPorcentaje(vacante.requisitos, userSkills);

    const sectorSize = [vacante.empresa.sector, vacante.empresa.tamanio]
      .filter(Boolean)
      .join(' · ');

    const empresaDescripcion = [sectorSize, vacante.ciudad].filter(Boolean).join(' · ');

    const ubicacion = [vacante.ciudad, vacante.pais].filter(Boolean).join(', ');

    const areaLabels: Record<string, string> = {
      Data_Analytics: 'Data Analytics',
      Desarrollo_Web: 'Desarrollo Web',
      UX_UI_Design: 'UX/UI Design',
      Ciberseguridad: 'Ciberseguridad',
      Cloud_DevOps: 'Cloud DevOps',
      Inteligencia_Artificial: 'Inteligencia Artificial',
      Marketing_Digital: 'Marketing Digital',
      Product_Management: 'Product Management',
    };

    const nivelLabels: Record<string, string> = {
      Jr_Entry_Level: 'Jr. / Entry Level',
      Semi_Senior: 'Semi Senior',
      Senior: 'Senior',
    };

    const modalidadLabels: Record<string, string> = {
      Presencial: 'Presencial',
      Hibrido: 'Híbrido',
      Remoto: '100% Remoto',
    };

    const jornadaLabels: Record<string, string> = {
      Jornada_completa: 'Jornada completa',
      Media_jornada: 'Media jornada',
      Relacion_dependencia: 'Relación de dependencia',
      Freelance: 'Freelance',
    };

    const educacionRequerida = vacante.educacion_requerida
      ? vacante.educacion_requerida.split(',').map((s) => s.trim())
      : [];

    const experienciaSolicitada = vacante.experiencia_solicitada
      ? vacante.experiencia_solicitada.split(',').map((s) => s.trim())
      : [];

    const idiomas = Array.isArray(vacante.idiomas_requeridos)
      ? (vacante.idiomas_requeridos as string[])
      : [];

    const jornada = vacante.jornada
      ? [jornadaLabels[vacante.jornada] ?? vacante.jornada]
      : [];

    const formatted = {
      id: vacante.vacante_id,
      titulo: vacante.titulo,
      empresa: vacante.empresa.nombre,
      empresaDescripcion: empresaDescripcion || null,
      logoUrl: vacante.empresa.logo_url,
      area: areaLabels[vacante.area] ?? vacante.area,
      nivel: nivelLabels[vacante.nivel] ?? vacante.nivel,
      modalidad: modalidadLabels[vacante.modalidad] ?? vacante.modalidad,
      modalidadDetallada: vacante.detalle_modalidad ?? null,
      ubicacion,
      distancia: vacante.distancia_zona ?? null,
      matchPorcentaje,
      fechaPublicacion: formatDate(vacante.fecha_publicacion),
      descripcion: vacante.descripcion,
      educacionRequerida,
      experienciaSolicitada,
      idioma: idiomas,
      jornada,
      skills: vacante.requisitos.map((r) => ({
        nombre: r.habilidad.nombre,
        laTienes: userSkills.some((us) => us.habilidad_id === r.habilidad.habilidad_id),
      })),
    };

    return NextResponse.json(formatted);
  } catch (error) {
    console.error('Error fetching vacante detail:', error);

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
