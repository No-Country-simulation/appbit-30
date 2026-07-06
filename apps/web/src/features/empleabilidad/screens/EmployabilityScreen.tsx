import { getCurrentUserState } from '@/src/server/auth/get-current-user-state';
import EmployabilityClient from './EmployabilityClient';

type Props = {
  params: Promise<{ locale: string }>;
  searchParams?: Promise<Record<string, string>>;
};

export default async function EmployabilityScreen({ params, searchParams }: Props) {
  const state = await getCurrentUserState();
  return <EmployabilityClient />;
}
