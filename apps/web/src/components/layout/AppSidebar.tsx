'use client';

/* eslint-disable @next/next/no-img-element */

import { useState } from 'react';
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
import { Link, usePathname, useRouter } from '@/src/i18n/navigation';
import { cn } from '@/lib/utils';

const navGroups = [
  [
    { labelKey: 'navInicio', icon: LayoutDashboard, href: '/dashboard' },
    { labelKey: 'navEmpleos', icon: Briefcase, href: '/empleabilidad' },
    { labelKey: 'navFormacion', icon: GraduationCap, href: '/formacion' },
  ],
  [
    { labelKey: 'navExperiencias', icon: Star, href: '/experiencias' },
    { labelKey: 'navMentorias', icon: Users, href: '/mentoria' },
  ],
  [{ labelKey: 'navBienestar', icon: Heart, href: '/bienestar' }],
];

interface Props {
  userName?: string;
  avatarUrl?: string | null;
  className?: string;
  onNavigate?: () => void;
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

export function AppSidebar({
  userName,
  avatarUrl,
  className,
  onNavigate,
}: Props) {
  const t = useTranslations('Dashboard');
  const router = useRouter();
  const pathname = usePathname();

  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [failedAvatarUrl, setFailedAvatarUrl] = useState<string | null>(null);

  const resolvedUserName = userName || t('profileFallbackName');

  async function handleLogout() {
    if (isLoggingOut) {
      return;
    }

    setIsLoggingOut(true);

    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
      });

      if (typeof window !== 'undefined') {
        localStorage.removeItem('onboarding_form_data');
        localStorage.removeItem('onboarding_step');
      }

      onNavigate?.();

      router.replace('/auth');
      router.refresh();
    } catch (error) {
      console.error('Logout error:', error);
      setIsLoggingOut(false);
    }
  }

  const shouldShowAvatar = Boolean(avatarUrl && failedAvatarUrl !== avatarUrl);

  return (
    <aside
      className={cn(
        'flex h-dvh w-full shrink-0 flex-col overflow-hidden border-r border-[var(--color-border)] bg-[var(--color-card)]',
        className,
      )}
    >
      <div className='flex h-[72px] shrink-0 items-center gap-2 border-b border-[var(--color-border)] px-6'>
        <span className='truncate font-heading text-lg font-black tracking-wide text-[var(--color-text)]'>
          Bi<span className='text-[var(--color-secondary)]'>.</span>T
        </span>
      </div>

      <div className='min-h-0 flex-1 overflow-y-auto px-4 py-3'>
        <nav className='min-w-0'>
          {navGroups.map((group, groupIndex) => (
            <div key={groupIndex}>
              {groupIndex > 0 && (
                <div className='my-3 border-t border-[var(--color-border)]' />
              )}

              <ul className='space-y-1.5'>
                {group.map((item) => {
                  const isActive =
                    item.href !== '#' &&
                    (pathname === item.href || pathname.startsWith(item.href));

                  const classes = cn(
                    'flex min-w-0 items-center gap-3 rounded-[var(--radius-md)] px-4 py-2.5 text-sm font-medium transition-colors duration-200',
                    isActive
                      ? 'bg-[var(--color-primary)] text-white'
                      : 'text-[var(--color-text-muted)] hover:bg-[var(--color-primary-pale)] hover:text-[var(--color-primary)]',
                  );

                  const content = (
                    <>
                      <item.icon className='size-5 shrink-0' />
                      <span className='truncate'>{t(item.labelKey)}</span>
                    </>
                  );

                  return (
                    <li key={item.labelKey}>
                      {item.href === '#' ? (
                        <a href={item.href} className={classes}>
                          {content}
                        </a>
                      ) : (
                        <Link
                          href={item.href}
                          className={classes}
                          onClick={onNavigate}
                        >
                          {content}
                        </Link>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        <div className='my-3 border-t border-[var(--color-border)]' />

        <a
          href='#'
          className='flex min-w-0 items-center gap-3 rounded-[var(--radius-md)] px-4 py-2.5 text-sm font-medium text-[var(--color-text-muted)] transition-colors duration-200 hover:bg-[var(--color-primary-pale)] hover:text-[var(--color-primary)]'
        >
          <User className='size-5 shrink-0' />
          <span className='truncate'>{t('miPerfil')}</span>
        </a>
      </div>

      <div className='flex shrink-0 items-center gap-3 border-t border-[var(--color-border)] px-6 py-4'>
        {shouldShowAvatar ? (
          <img
            key={avatarUrl}
            src={avatarUrl!}
            alt={t('profileAvatarAlt', { nombre: resolvedUserName })}
            className='size-10 shrink-0 rounded-full object-cover'
            referrerPolicy='no-referrer'
            onError={() => setFailedAvatarUrl(avatarUrl ?? null)}
          />
        ) : (
          <div className='flex size-10 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary-pale)] text-sm font-bold text-[var(--color-primary)]'>
            {getInitials(resolvedUserName)}
          </div>
        )}

        <div className='flex min-w-0 flex-1 flex-col'>
          <span className='truncate text-sm font-medium text-[var(--color-text)]'>
            {resolvedUserName}
          </span>

          <button
            type='button'
            onClick={handleLogout}
            disabled={isLoggingOut}
            className='w-fit max-w-full truncate text-left text-xs font-medium text-[var(--color-text-muted)] transition-colors hover:text-[var(--color-danger)] hover:underline disabled:cursor-not-allowed disabled:opacity-60'
          >
            {isLoggingOut ? t('cerrandoSesion') : t('cerrarSesion')}
          </button>
        </div>
      </div>
    </aside>
  );
}
