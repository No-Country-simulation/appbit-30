import { dbClient } from '@/src/server/clients/db.client';
import type { PostulacionItem } from '../types';

export async function listPostulaciones(
  usuarioId: string,
): Promise<PostulacionItem[]> {
  const postulaciones = await dbClient.postulaciones.findMany({
    where: { usuario_id: usuarioId },
    include: { vacante: { include: { empresa: true } } },
    orderBy: { creado_en: 'desc' },
  });

  return postulaciones.map((item) => ({
    id: item.postulacion_id,
    vacanteId: item.vacante_id,
    titulo: item.vacante.titulo,
    empresa: item.vacante.empresa.nombre,
    logoUrl: item.vacante.empresa.logo_url,
    estado: item.estado,
    matchPorcentaje:
      item.match_porcentaje === null ? null : Number(item.match_porcentaje),
    feedback: null,
    skillRechazada: null,
    mensajesNuevos: 0,
    creadoEn: item.creado_en.toISOString(),
  }));
}
