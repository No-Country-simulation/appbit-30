import { redirect } from 'next/navigation';
import { getAuthRedirectPath } from '@/src/server/auth/get-auth-redirect-path';

type Props = {
  params: Promise<{
    locale: string;
  }>;
};

export default async function HomePage({ params }: Props) {
  const { locale } = await params;

  redirect(await getAuthRedirectPath(locale));
}
