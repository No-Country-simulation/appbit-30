'use client';

/* eslint-disable @next/next/no-img-element */

import { useTranslations } from 'next-intl';
import {
  LayoutDashboard,
  Briefcase,
  GraduationCap,
  Star,
  Users,
  Heart,
  User,
} from 'lucide-react';
import { Link } from '@/src/i18n/navigation';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { href: '/dashboard', labelKey: 'dashboard', icon: Home },
  { href: '/empleabilidad', labelKey: 'empleabilidad', icon: Briefcase },
  { href: '/playground', labelKey: 'playground', icon: Shapes },
] as const;

interface Props {
  userName?: string;
  avatarUrl?: string | null;
}

function getInitials(name: string) {
  const initials = name
    .trim()
    .split(/\s+/)
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return initials || 'U';
}

export function AppSidebar({ userName, avatarUrl }: Props) {
  const t = useTranslations('Dashboard');
  const tCommon = useTranslations('Common');

  const resolvedUserName = userName || t('profileFallbackName');

  return (
    <aside className='flex min-h-screen w-[var(--sidebar-width)] flex-col border-r border-[var(--color-border)] bg-[var(--color-card)]'>
      <div className='flex items-center gap-2 border-b border-[var(--color-border)] px-6 py-5'>
        <span className='font-heading text-lg font-black text-[var(--color-text)]'>
          {tCommon('brand')}
        </span>
      </div>

      <nav className='flex-1 px-4 py-3'>
        {navGroups.map((group, groupIndex) => (
          <div key={groupIndex}>
            {groupIndex > 0 && (
              <div className='my-3 border-t border-[var(--color-border)]' />
            )}

            <ul className='space-y-1.5'>
              {group.map((item) => {
                const classes = cn(
                  'flex items-center gap-3 rounded-[var(--radius-md)] px-4 py-2.5 text-sm font-medium transition-all duration-200',
                  item.href === '/dashboard'
                    ? 'bg-[var(--color-primary)] text-white'
                    : 'text-[var(--color-text-muted)] hover:bg-[var(--color-primary-pale)] hover:pl-5 hover:text-[var(--color-primary)]',
                );

                return (
                  <li key={item.labelKey}>
                    {item.href === '#' ? (
                      <a href={item.href} className={classes}>
                        <item.icon className='size-5 shrink-0' />
                        {t(item.labelKey)}
                      </a>
                    ) : (
                      <Link href={item.href} className={classes}>
                        <item.icon className='size-5 shrink-0' />
                        {t(item.labelKey)}
                      </Link>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className='border-t border-[var(--color-border)] px-4 py-3'>
        <a
          href='#'
          className='flex items-center gap-3 rounded-[var(--radius-md)] px-4 py-2.5 text-sm font-medium text-[var(--color-text-muted)] transition-all duration-200 hover:bg-[var(--color-primary-pale)] hover:pl-5 hover:text-[var(--color-primary)]'
        >
          <User className='size-5 shrink-0' />
          {t('miPerfil')}
        </a>
      </div>

      <div className='flex items-center gap-3 border-t border-[var(--color-border)] px-6 py-4'>
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={t('profileAvatarAlt', { nombre: resolvedUserName })}
            className='size-10 rounded-full object-cover'
          />
        ) : (
          <div className='flex size-10 items-center justify-center rounded-full bg-[var(--color-primary-pale)] text-sm font-bold text-[var(--color-primary)]'>
            {getInitials(resolvedUserName)}
          </div>
        )}

        <div className='flex min-w-0 flex-col'>
          <span className='truncate text-sm font-medium text-[var(--color-text)]'>
            {resolvedUserName}
          </span>

          <span className='text-xs text-[var(--color-text-muted)]'>
            {t('verPerfil')}
          </span>
        </div>
      </div>
    </aside>
  );
}
