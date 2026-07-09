import { redirect } from 'next/navigation';
import { getModulePlayerData } from '../server/get-module-player-data';
import { ModulePlayerPage } from '../components/ModulePlayerPage';

interface Props {
  usuarioId: string;
  moduleId: string;
  locale: string;
}

export default async function ModulePlayerScreen({
  usuarioId,
  moduleId,
  locale,
}: Props) {
  const data = await getModulePlayerData({
    usuarioId,
    moduleId,
    locale,
  });

  if (!data) {
    redirect(`/${locale}/formacion`);
  }

  return <ModulePlayerPage data={data} />;
}
