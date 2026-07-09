import { dbClient } from '@/src/server/clients/db.client';
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

  const onboardingCompleted = usuario.onboarding_status === 'COMPLETED';

  const ubicacionCompleted = Boolean(
    usuario.home_cluster || usuario.perfil_movilidad?.home_cluster,
  );

  const whatsappCompleted = Boolean(
    usuario.whatsapp_codigo && usuario.whatsapp_numero,
  );

  let profilePercent = 0;

  if (onboardingCompleted) profilePercent += 50;
  if (usuario.perfil_movilidad) profilePercent += 20;
  if (usuario.avatar_url) profilePercent += 10;
  if (ubicacionCompleted) profilePercent += 10;
  if (whatsappCompleted) profilePercent += 10;

  return {
    user: {
      name: usuario.nombre_completo,
      avatarUrl: usuario.avatar_url,
      profilePercent,
      perfilBreakdown: {
        onboarding: onboardingCompleted,
        movilidad: Boolean(usuario.perfil_movilidad),
        avatar: Boolean(usuario.avatar_url),
        ubicacion: ubicacionCompleted,
        whatsapp: whatsappCompleted,
      },
    },
  };
}
