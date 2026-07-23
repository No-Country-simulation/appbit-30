import { dbClient } from '@/src/server/clients/db.client';
import type { EmployabilityData } from '../types';
import { listVacantes } from './employability.service';
import { listPostulaciones } from './postulaciones.service';

function buildProfilePercent(usuario: {
  onboarding_status: string | null;
  avatar_url: string | null;
  home_cluster: string | null;
  whatsapp_codigo: string | null;
  whatsapp_numero: string | null;
  perfil_movilidad: { id: string; home_cluster: string | null } | null;
}) {
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
    profilePercent,
    perfilBreakdown: {
      onboarding: onboardingCompleted,
      movilidad: Boolean(usuario.perfil_movilidad),
      avatar: Boolean(usuario.avatar_url),
      ubicacion: ubicacionCompleted,
      whatsapp: whatsappCompleted,
    },
  };
}

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

  const profile = buildProfilePercent(usuario);
  return {
    user: {
      name: usuario.nombre_completo,
      avatarUrl: usuario.avatar_url,
      profilePercent: profile.profilePercent,
      perfilBreakdown: profile.perfilBreakdown,
    },
    vacantes: vacanciesResult.data,
    postulaciones,
  };
}
