import { AppHeader } from './AppHeader';
import { AppSidebar } from './AppSidebar';

interface Props {
  children: React.ReactNode;
}

export function AppShell({ children }: Props) {
  return (
    <div className='flex min-h-screen'>
      <AppSidebar />

      <div className='flex-1 flex flex-col'>
        <AppHeader />

        <main className='flex-1 p-8'>{children}</main>
      </div>
    </div>
  );
}
