'use client';

import { useTranslations } from 'next-intl';
import { Link, usePathname } from '@/src/i18n/navigation';
import { Home, Briefcase, Shapes } from 'lucide-react';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { href: '/dashboard', labelKey: 'dashboard', icon: Home },
  { href: '/empleabilidad', labelKey: 'empleabilidad', icon: Briefcase },
  { href: '/playground', labelKey: 'playground', icon: Shapes },
] as const;

export function AppSidebar() {
  const t = useTranslations('Navigation');
  const pathname = usePathname();

  return (
    <aside className='flex w-[var(--sidebar-width)] min-h-screen flex-col border-r border-[var(--color-border)] bg-[var(--color-card)] p-6'>
      <Link href='/dashboard' className='mb-8 text-xl font-bold text-[var(--color-primary)]'>
        Bi.T
      </Link>

      <nav className='flex flex-col gap-1'>
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = pathname?.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-[var(--color-primary-pale)] text-[var(--color-primary)]'
                  : 'text-[var(--color-text-muted)] hover:bg-[var(--color-primary-pale)] hover:text-[var(--color-primary)]',
              )}
            >
              <Icon className='size-5' />
              {t(item.labelKey)}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
