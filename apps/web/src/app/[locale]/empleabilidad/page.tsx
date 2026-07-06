import EmployabilityScreen from '@/src/features/empleabilidad/screens/EmployabilityScreen';

export const dynamic = 'force-dynamic';

type Props = {
  params: Promise<{ locale: string }>;
  searchParams?: Promise<Record<string, string>>;
};

export default function EmpleabilidadPage(props: Props) {
  return <EmployabilityScreen {...props} />;
}
