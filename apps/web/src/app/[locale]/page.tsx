import { redirect } from 'next/navigation';
import { getAuthRedirectPath } from '@/src/server/auth/get-auth-redirect-path';
import AuthStateUnavailable from '@/src/features/auth/components/AuthStateUnavailable';

export const dynamic = 'force-dynamic';

type Props = {
  params: Promise<{
    locale: string;
  }>;
};

export default async function HomePage({ params }: Props) {
  const { locale } = await params;

  let redirectPath: Awaited<ReturnType<typeof getAuthRedirectPath>>;

  try {
    redirectPath = await getAuthRedirectPath(locale);
  } catch (error) {
    console.error('Error resolving home auth redirect path:', error);

    return <AuthStateUnavailable locale={locale} retryPath='/' />;
  }

  redirect(redirectPath);
}
