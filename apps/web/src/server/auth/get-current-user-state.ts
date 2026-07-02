import { getCurrentAuthUser } from './get-current-auth-user';
import { findLinkedUsuario } from './find-linked-usuario';

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

  const linkedUsuario = await findLinkedUsuario(authUser, usuarioSelect);

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
