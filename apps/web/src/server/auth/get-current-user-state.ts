import { dbClient } from '@/src/server/clients/db.client';
import { getCurrentAuthUser } from './get-current-auth-user';

const usuarioSelect = {
  usuario_id: true,
  auth_uid: true,
  email: true,
  nombre_completo: true,
  avatar_url: true,
  idioma_app: true,
  onboarding_status: true,
} as const;

export async function getCurrentUserState() {
  const authUser = await getCurrentAuthUser();

  if (!authUser) {
    return {
      authUser: null,
      usuario: null,
      isAuthenticated: false,
      needsOnboarding: false,
      hasCompletedOnboarding: false,
    };
  }

  const usuario = await dbClient.usuarios.findFirst({
    where: authUser.email
      ? {
          OR: [{ auth_uid: authUser.id }, { email: authUser.email }],
        }
      : {
          auth_uid: authUser.id,
        },
    select: usuarioSelect,
  });

  /**
   * Caso útil para datos seed o usuarios preexistentes:
   * si existe usuario por email pero todavía no tiene auth_uid,
   * lo vinculamos al auth user actual.
   */
  const linkedUsuario =
    usuario && !usuario.auth_uid
      ? await dbClient.usuarios.update({
          where: {
            usuario_id: usuario.usuario_id,
          },
          data: {
            auth_uid: authUser.id,
          },
          select: usuarioSelect,
        })
      : usuario;

  const hasCompletedOnboarding =
    linkedUsuario?.onboarding_status === 'COMPLETED';

  return {
    authUser,
    usuario: linkedUsuario,
    isAuthenticated: true,
    needsOnboarding: !hasCompletedOnboarding,
    hasCompletedOnboarding,
  };
}
