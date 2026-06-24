import { NextResponse } from 'next/server';
import { hasLocale } from 'next-intl';
import { routing } from '@/src/i18n/routing';
import { createClient } from '@/src/lib/supabase/server';
import { getAuthRedirectPath } from '@/src/server/auth/get-auth-redirect-path';

type Params = Promise<{
  locale: string;
}>;

export async function GET(request: Request, { params }: { params: Params }) {
  const { locale } = await params;

  const safeLocale = hasLocale(routing.locales, locale)
    ? locale
    : routing.defaultLocale;

  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');

  if (!code) {
    return NextResponse.redirect(
      new URL(`/${safeLocale}/auth?error=missing_code`, requestUrl.origin),
    );
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(
      new URL(`/${safeLocale}/auth?error=callback_failed`, requestUrl.origin),
    );
  }

  const redirectPath = await getAuthRedirectPath(safeLocale);

  return NextResponse.redirect(new URL(redirectPath, requestUrl.origin));
}
