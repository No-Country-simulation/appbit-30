import MentoriaClient from './MentoriaClient';
import { getMentoriaData } from '../server/get-mentoria-data';

interface Props {
  usuarioId: string;
  locale: string;
}

export default async function MentoriaScreen({ usuarioId, locale }: Props) {
  const data = await getMentoriaData({
    usuarioId,
    locale,
  });

  return <MentoriaClient data={data} />;
}
