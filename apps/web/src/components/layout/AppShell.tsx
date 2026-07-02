'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { AppHeader } from './AppHeader';
import { AppSidebar } from './AppSidebar';

interface PerfilBreakdown {
  onboarding: boolean;
  movilidad: boolean;
  avatar: boolean;
  ubicacion: boolean;
  whatsapp: boolean;
}

interface Props {
  children: React.ReactNode;
  onCheckinClick?: () => void;
  userName?: string;
  avatarUrl?: string | null;
  profilePercent?: number;
  perfilBreakdown?: PerfilBreakdown;
}

export function AppShell({
  children,
  onCheckinClick,
  userName,
  avatarUrl,
  profilePercent,
  perfilBreakdown,
}: Props) {
  const t = useTranslations('Dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className='min-h-screen bg-[var(--color-body)]'>
      <div className='flex min-h-screen'>
        <div className='hidden lg:block'>
          <AppSidebar userName={userName} avatarUrl={avatarUrl} />
        </div>

        {isSidebarOpen && (
          <div className='fixed inset-0 z-50 lg:hidden'>
            <button
              type='button'
              aria-label={t('closeMenu')}
              className='absolute inset-0 bg-black/40'
              onClick={() => setIsSidebarOpen(false)}
            />

            <div className='relative h-full w-[var(--sidebar-width)] max-w-[85vw]'>
              <AppSidebar userName={userName} avatarUrl={avatarUrl} />
            </div>
          </div>
        )}

        <div className='flex min-w-0 flex-1 flex-col'>
          <AppHeader
            onMenuClick={() => setIsSidebarOpen(true)}
            onCheckinClick={onCheckinClick}
            profilePercent={profilePercent}
            perfilBreakdown={perfilBreakdown}
          />

          <main className='flex-1 px-4 py-6 sm:px-6 lg:px-8'>{children}</main>
        </div>
      </div>
    </div>
  );
}
