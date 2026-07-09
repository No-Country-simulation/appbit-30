import FormacionClient from './FormacionClient';
import { getFormacionData } from '../server/get-formacion-data';

interface Props {
  usuarioId: string;
  locale: string;
}

export default async function FormacionScreen({ usuarioId, locale }: Props) {
  const data = await getFormacionData({
    usuarioId,
    locale,
  });

  return <FormacionClient data={data} />;
}
