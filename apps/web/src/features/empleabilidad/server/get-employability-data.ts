import { dbClient } from '@/src/server/clients/db.client';
import type { EmployabilityData } from '../types';
import { listVacantes } from './employability.service';
import { listPostulaciones } from './postulaciones.service';
import { buildProfileCompletion } from '@/src/features/profile/profile-completion';

export async function getEmployabilityData(params: {
  usuarioId: string;
  locale: string;
}): Promise<EmployabilityData> {
  const { usuarioId } = params;

  const [usuario, vacanciesResult, postulaciones] = await Promise.all([
    dbClient.usuarios.findUnique({
      where: { usuario_id: usuarioId },
      select: {
        nombre_completo: true,
        avatar_url: true,
        onboarding_status: true,
        pais: true,
        ciudad: true,
        home_cluster: true,
        whatsapp_codigo: true,
        whatsapp_numero: true,
        perfil_movilidad: { select: { id: true, home_cluster: true } },
      },
    }),
    listVacantes(usuarioId, { page: 1, limit: 100 }),
    listPostulaciones(usuarioId),
  ]);

  if (!usuario) {
    return { user: {}, vacantes: vacanciesResult.data, postulaciones };
  }

  const profileCompletion = buildProfileCompletion(usuario);
  return {
    user: {
      name: usuario.nombre_completo,
      avatarUrl: usuario.avatar_url,
      profilePercent: profileCompletion.profilePercent,
      perfilBreakdown: profileCompletion.perfilBreakdown,
    },
    vacantes: vacanciesResult.data,
    postulaciones,
  };
}
