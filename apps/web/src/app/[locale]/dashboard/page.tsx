import DashboardScreen from '@/src/features/dashboard/screens/DashboardScreen';

export const dynamic = 'force-dynamic';

type Props = {
  params: Promise<{
    locale: string;
  }>;
  searchParams?: Promise<{
    onboarding?: string;
  }>;
};

export default function DashboardPage(props: Props) {
  return <DashboardScreen {...props} />;
}
