import { getCurrentUserState } from '@/src/server/auth/get-current-user-state';
import BienestarClient from '@/src/features/bienestar/screens/BienestarClient';

export const dynamic = 'force-dynamic';

export default async function BienestarPage() {
  await getCurrentUserState();
  return <BienestarClient />;
}
