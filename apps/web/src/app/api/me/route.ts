import { NextResponse } from 'next/server';
import { getCurrentUserState } from '@/src/server/auth/get-current-user-state';

export async function GET() {
  const state = await getCurrentUserState();

  if (!state.authUser) {
    return NextResponse.json(
      {
        error: 'Unauthorized',
      },
      {
        status: 401,
      },
    );
  }

  return NextResponse.json({
    auth: {
      id: state.authUser.id,
      email: state.authUser.email,
      provider: state.authUser.app_metadata.provider ?? null,
    },
    usuario: state.usuario,
    needsOnboarding: state.needsOnboarding,
    hasCompletedOnboarding: state.hasCompletedOnboarding,
  });
}
