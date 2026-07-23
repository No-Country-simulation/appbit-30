import { getCurrentAuthUser } from './get-current-auth-user';
import { findLinkedUsuario } from './find-linked-usuario';

export async function getAuthenticatedUsuarioId() {
  const authUser = await getCurrentAuthUser();
  if (!authUser) return { error: 'Unauthorized' as const, status: 401 as const };

  const usuario = await findLinkedUsuario(authUser, { usuario_id: true });
  if (!usuario) {
    return { error: 'User not found' as const, status: 404 as const };
  }

  return { usuarioId: usuario.usuario_id };
}
