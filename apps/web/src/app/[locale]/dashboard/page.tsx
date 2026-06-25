import DashboardScreen from '@/src/features/dashboard/screens/DashboardScreen';

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
