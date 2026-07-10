import EmployabilityClient from './EmployabilityClient';
import { getEmployabilityData } from '../server/get-employability-data';

interface Props {
  usuarioId: string;
  locale: string;
}

export default async function EmployabilityScreen({
  usuarioId,
  locale,
}: Props) {
  const data = await getEmployabilityData({
    usuarioId,
    locale,
  });

  return <EmployabilityClient data={data} />;
}
