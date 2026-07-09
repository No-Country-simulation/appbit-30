import { getBienestarData } from '../server/get-bienestar-data';
import BienestarClient from './BienestarClient';

interface Props {
  usuarioId: string;
  locale: string;
}

export default async function BienestarScreen({ usuarioId, locale }: Props) {
  const data = await getBienestarData({
    usuarioId,
    locale,
  });

  return <BienestarClient data={data} />;
}
