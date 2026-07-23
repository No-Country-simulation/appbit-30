'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { AppHeader } from './AppHeader';
import { AppSidebar } from './AppSidebar';
import type { PerfilBreakdown } from '@/src/features/profile/profile-completion';

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

  useEffect(() => {
    if (!isSidebarOpen) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsSidebarOpen(false);
      }
    }

    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isSidebarOpen]);

  return (
    <div className='min-h-dvh overflow-x-hidden bg-[var(--color-body)]'>
      <div className='fixed inset-y-0 left-0 z-40 hidden w-[var(--sidebar-width)] lg:block'>
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

          <div className='absolute inset-y-0 left-0 z-10 w-[min(var(--sidebar-width),85vw)] max-w-[85vw]'>
            <AppSidebar
              userName={userName}
              avatarUrl={avatarUrl}
              className='w-full shadow-2xl'
              onNavigate={() => setIsSidebarOpen(false)}
            />
          </div>
        </div>
      )}

      <div className='flex min-h-dvh min-w-0 flex-col overflow-x-hidden lg:pl-[var(--sidebar-width)]'>
        <AppHeader
          onMenuClick={() => setIsSidebarOpen(true)}
          onCheckinClick={onCheckinClick}
          profilePercent={profilePercent}
          perfilBreakdown={perfilBreakdown}
        />

        <main className='min-w-0 flex-1 overflow-x-hidden px-4 py-5 sm:px-6 sm:py-6 lg:px-8 2xl:px-10'>
          <div className='mx-auto w-full max-w-[1440px]'>{children}</div>
        </main>
      </div>
    </div>
  );
}
