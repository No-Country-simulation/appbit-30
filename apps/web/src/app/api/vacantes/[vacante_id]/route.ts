import { NextResponse } from 'next/server';
import { dbClient } from '@/src/server/clients/db.client';

export const dynamic = 'force-dynamic';

export async function GET(
  _request: Request,
  { params }: { params: { vacante_id: string } },
) {
  try {
    const vacante = await dbClient.vacantes.findUnique({
      where: { vacante_id: params.vacante_id },
      include: {
        empresa: {
          select: { empresa_id: true, nombre: true, descripcion: true, logo_url: true, sector: true, tamanio: true },
        },
        requisitos: {
          include: { habilidad: { select: { habilidad_id: true, nombre: true, categoria: true, area_principal: true } } },
          orderBy: { prioridad: 'desc' },
        },
      },
    });

    if (!vacante || !vacante.activa) {
      return NextResponse.json({ error: 'Vacante not found' }, { status: 404 });
    }

    return NextResponse.json({
      vacante_id: vacante.vacante_id,
      titulo: vacante.titulo,
      area: vacante.area,
      nivel: vacante.nivel,
      descripcion: vacante.descripcion,
      educacion_requerida: vacante.educacion_requerida,
      experiencia_solicitada: vacante.experiencia_solicitada,
      jornada: vacante.jornada,
      modalidad: vacante.modalidad,
      pais: vacante.pais,
      ciudad: vacante.ciudad,
      detalle_modalidad: vacante.detalle_modalidad,
      distancia_zona: vacante.distancia_zona,
      idiomas_requeridos: vacante.idiomas_requeridos,
      fecha_publicacion: vacante.fecha_publicacion,
      empresa: vacante.empresa,
      requisitos: vacante.requisitos.map((r) => ({
        requisito_id: r.requisito_id,
        prioridad: r.prioridad,
        habilidad: r.habilidad,
      })),
    });
  } catch (error) {
    console.error('Error fetching vacante detail:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
