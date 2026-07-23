import { dbClient } from '@/src/server/clients/db.client';
import { buildProfileCompletion } from '@/src/features/profile/profile-completion';
import type { MentoriaData } from '../types';

export async function getMentoriaData(params: {
  usuarioId: string;
  locale: string;
}): Promise<MentoriaData> {
  const { usuarioId } = params;

  const usuario = await dbClient.usuarios.findUnique({
    where: {
      usuario_id: usuarioId,
    },
    select: {
      nombre_completo: true,
      avatar_url: true,
      onboarding_status: true,
      pais: true,
      ciudad: true,
      home_cluster: true,
      whatsapp_codigo: true,
      whatsapp_numero: true,
      perfil_movilidad: {
        select: {
          id: true,
          home_cluster: true,
        },
      },
    },
  });

  if (!usuario) {
    return {
      user: {},
    };
  }

  const profileCompletion = buildProfileCompletion(usuario);

  return {
    user: {
      name: usuario.nombre_completo,
      avatarUrl: usuario.avatar_url,
      profilePercent: profileCompletion.profilePercent,
      perfilBreakdown: profileCompletion.perfilBreakdown,
    },
  };
}
