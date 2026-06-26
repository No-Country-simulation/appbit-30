'use client';

import { useMemo } from 'react';
import { useLocale } from 'next-intl';
import { AppButton } from '@/src/components';
import { useRouter } from '@/src/i18n/navigation';
import { createClient } from '@/src/lib/supabase/client';

export function SignOutButton() {
  const locale = useLocale();
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

  async function handleSignOut() {
    await supabase.auth.signOut();

    router.replace('/auth', { locale });
    router.refresh();
  }

  return (
    <AppButton type='button' variant='outline' onClick={handleSignOut}>
      Cerrar sesión
    </AppButton>
  );
}
