import { NextResponse } from 'next/server';
import { dbClient } from '@/src/server/clients/db.client';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const area = searchParams.get('area');
    const pais = searchParams.get('pais');
    const modalidad = searchParams.get('modalidad');
    const nivel = searchParams.get('nivel');

    const where = { activa: true } as Record<string, unknown>;
    if (area) where.area = area;
    if (pais) where.pais = pais;
    if (modalidad) where.modalidad = modalidad;
    if (nivel) where.nivel = nivel;

    const vacantes = await dbClient.vacantes.findMany({
      where,
      include: {
        empresa: { select: { empresa_id: true, nombre: true, logo_url: true, sector: true, tamanio: true } },
        requisitos: { include: { habilidad: { select: { habilidad_id: true, nombre: true, categoria: true } } } },
        _count: { select: { postulaciones: true } },
      },
      orderBy: { fecha_publicacion: 'desc' },
    });

    return NextResponse.json({
      vacantes: vacantes.map((v) => ({
        vacante_id: v.vacante_id,
        titulo: v.titulo,
        area: v.area,
        nivel: v.nivel,
        descripcion: v.descripcion,
        jornada: v.jornada,
        modalidad: v.modalidad,
        pais: v.pais,
        ciudad: v.ciudad,
        detalle_modalidad: v.detalle_modalidad,
        distancia_zona: v.distancia_zona,
        idiomas_requeridos: v.idiomas_requeridos,
        fecha_publicacion: v.fecha_publicacion,
        empresa: v.empresa,
        requisitos: v.requisitos.map((r) => ({ requisito_id: r.requisito_id, prioridad: r.prioridad, habilidad: r.habilidad })),
        total_postulaciones: v._count.postulaciones,
        match_porcentaje: null,
      })),
      total: vacantes.length,
    });
  } catch (error) {
    console.error('Error fetching vacantes:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
