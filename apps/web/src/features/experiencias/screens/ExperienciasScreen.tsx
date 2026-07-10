import { ExperienciasClient } from './ExperienciasClient';
import { getExperienciasData } from '../server/get-experiencias-data';

interface Props {
  usuarioId: string;
  locale: string;
}

export async function ExperienciasScreen({ usuarioId, locale }: Props) {
  const data = await getExperienciasData({
    usuarioId,
    locale,
  });

  return <ExperienciasClient data={data} />;
}
