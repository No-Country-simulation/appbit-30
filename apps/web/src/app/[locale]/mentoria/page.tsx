import { getCurrentUserState } from '@/src/server/auth/get-current-user-state';
import MentoriaClient from '@/src/features/mentoria/screens/MentoriaClient';

export const dynamic = 'force-dynamic';

export default async function MentoriaPage() {
  await getCurrentUserState();
  return <MentoriaClient />;
}
