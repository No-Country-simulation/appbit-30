'use client';

import { useState } from 'react';
import { AppHeader } from './AppHeader';
import { AppSidebar } from './AppSidebar';

interface Props {
  children: React.ReactNode;
}

export function AppShell({ children }: Props) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className='min-h-screen bg-[var(--color-body)]'>
      <div className='flex min-h-screen'>
        <div className='hidden lg:block'>
          <AppSidebar />
        </div>

        {isSidebarOpen && (
          <div className='fixed inset-0 z-50 lg:hidden'>
            <button
              type='button'
              aria-label='Cerrar menú'
              className='absolute inset-0 bg-black/40'
              onClick={() => setIsSidebarOpen(false)}
            />

            <div className='relative h-full w-[var(--sidebar-width)] max-w-[85vw]'>
              <AppSidebar />
            </div>
          </div>
        )}

        <div className='flex min-w-0 flex-1 flex-col'>
          <AppHeader onMenuClick={() => setIsSidebarOpen(true)} />

          <main className='flex-1 px-4 py-6 sm:px-6 lg:px-8'>{children}</main>
        </div>
      </div>
    </div>
  );
}
