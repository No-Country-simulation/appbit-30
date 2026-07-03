import type { User } from '@supabase/supabase-js';
import { dbClient } from '@/src/server/clients/db.client';
import type { Prisma } from '@/src/server/generated/prisma';

function usuarioWhereForAuthUser(authUser: User): Prisma.UsuariosWhereInput {
  return authUser.email
    ? {
        OR: [{ auth_uid: authUser.id }, { email: authUser.email }],
      }
    : {
        auth_uid: authUser.id,
      };
}

type LinkedUsuarioSelect<S extends Prisma.UsuariosSelect> = S & {
  usuario_id: true;
  auth_uid: true;
};

type LinkedUsuario<S extends Prisma.UsuariosSelect> =
  Prisma.UsuariosGetPayload<{ select: LinkedUsuarioSelect<S> }>;

export async function findLinkedUsuario<S extends Prisma.UsuariosSelect>(
  authUser: User,
  select: S,
): Promise<LinkedUsuario<S> | null> {
  const selectWithLinkFields: LinkedUsuarioSelect<S> = {
    ...select,
    usuario_id: true,
    auth_uid: true,
  };

  const found = await dbClient.usuarios.findFirst({
    where: usuarioWhereForAuthUser(authUser),
    select: selectWithLinkFields,
  });

  if (!found) {
    return null;
  }

  const { usuario_id, auth_uid } = found as {
    usuario_id: string;
    auth_uid: string | null;
  };

  if (auth_uid) {
    return found as LinkedUsuario<S>;
  }

  return dbClient.usuarios.update({
    where: {
      usuario_id,
    },
    data: {
      auth_uid: authUser.id,
    },
    select: selectWithLinkFields,
  });
}
