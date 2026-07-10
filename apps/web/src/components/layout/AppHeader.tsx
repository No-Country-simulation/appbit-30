'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { BellIcon, Info } from 'lucide-react';
import { AppIcon, AppLanguageSwitcher } from '@/src/components';
import { AppBadge } from '@/src/components/app/AppBadge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/src/components/ui/dialog';

interface PerfilBreakdown {
  onboarding: boolean;
  movilidad: boolean;
  avatar: boolean;
  ubicacion: boolean;
  whatsapp: boolean;
}

interface Props {
  onMenuClick?: () => void;
  onCheckinClick?: () => void;
  profilePercent?: number;
  perfilBreakdown?: PerfilBreakdown;
}

export function AppHeader({
  onMenuClick,
  profilePercent,
  perfilBreakdown,
}: Props) {
  const t = useTranslations('Dashboard');
  const [breakdownOpen, setBreakdownOpen] = useState(false);

  const hasProfilePercent = typeof profilePercent === 'number';

  const safeProfilePercent = hasProfilePercent
    ? Math.max(0, Math.min(100, profilePercent))
    : 0;

  const items = perfilBreakdown
    ? [
        {
          key: 'onboarding' as const,
          label: t('perfilBreakdownOnboarding'),
          points: 50,
        },
        {
          key: 'movilidad' as const,
          label: t('perfilBreakdownMovilidad'),
          points: 20,
        },
        {
          key: 'avatar' as const,
          label: t('perfilBreakdownAvatar'),
          points: 10,
        },
        {
          key: 'ubicacion' as const,
          label: t('perfilBreakdownUbicacion'),
          points: 10,
        },
        {
          key: 'whatsapp' as const,
          label: t('perfilBreakdownWhatsapp'),
          points: 10,
        },
      ]
    : [];

  return (
    <header className='sticky top-0 z-40 flex min-h-16 items-center justify-between gap-3 border-b border-[var(--color-border)] bg-[var(--color-card)] px-4 sm:px-6'>
      <div className='flex min-w-0 flex-1 items-center gap-3'>
        <button
          type='button'
          aria-label={t('openMenu')}
          onClick={onMenuClick}
          className='inline-flex size-10 shrink-0 items-center justify-center rounded-[var(--radius-sm)] border border-[var(--color-border)] text-[var(--color-text)] transition-colors hover:bg-[var(--color-primary-pale)] hover:text-[var(--color-primary)] lg:hidden'
        >
          <AppIcon name='menu' className='size-5' />
        </button>

        <div className='flex min-w-0 flex-1 items-center gap-2'>
          {hasProfilePercent ? (
            <>
              <span className='shrink-0 whitespace-nowrap text-[11px] font-semibold text-[var(--color-success-text)] sm:text-xs'>
                {t('perfilProgreso', {
                  porcentaje: safeProfilePercent.toString(),
                })}
              </span>

              <div className='hidden h-2 w-20 overflow-hidden rounded-full bg-[var(--color-border)] sm:block md:w-28'>
                <div
                  className='h-full rounded-full bg-[var(--color-success)] transition-all duration-500'
                  style={{ width: `${safeProfilePercent}%` }}
                />
              </div>

              {perfilBreakdown && (
                <button
                  type='button'
                  aria-label={t('perfilBreakdownTitle')}
                  onClick={() => setBreakdownOpen(true)}
                  className='inline-flex size-7 shrink-0 items-center justify-center rounded-full text-[var(--color-text-muted)] transition-colors hover:bg-[var(--color-primary-pale)] hover:text-[var(--color-primary)]'
                >
                  <Info className='size-4' />
                </button>
              )}
            </>
          ) : (
            <div className='flex min-w-0 items-center gap-2'>
              <div className='h-3 w-20 animate-pulse rounded bg-[var(--color-border)]' />
              <div className='hidden h-2 w-20 animate-pulse rounded bg-[var(--color-border)] sm:block' />
            </div>
          )}
        </div>
      </div>

      <div className='flex shrink-0 items-center gap-2'>
        <div className='hidden xl:block'>
          <AppBadge variant='warning'>{t('offlineSuggested')}</AppBadge>
        </div>

        <button
          type='button'
          aria-label={t('notifications')}
          className='inline-flex size-10 shrink-0 items-center justify-center rounded-[var(--radius-sm)] text-[var(--color-text-muted)] transition-colors hover:bg-[var(--color-primary-pale)] hover:text-[var(--color-primary)]'
        >
          <BellIcon className='size-5' />
        </button>

        <div className='min-w-0 shrink-0'>
          <AppLanguageSwitcher />
        </div>
      </div>

      <Dialog open={breakdownOpen} onOpenChange={setBreakdownOpen}>
        <DialogContent className='safe-modal-content w-[min(calc(100vw-1rem),22rem)] p-0'>
          <div className='border-b border-[var(--color-border)] px-4 py-4 sm:px-5'>
            <DialogHeader>
              <DialogTitle className='break-words text-base leading-tight'>
                {t('perfilBreakdownTitle')}
              </DialogTitle>
            </DialogHeader>
          </div>

          <div className='px-4 py-4 sm:px-5'>
            <ul className='space-y-3 text-sm'>
              {items.map((item) => {
                const completed = perfilBreakdown?.[item.key];

                return (
                  <li
                    key={item.key}
                    className='flex min-w-0 items-center justify-between gap-3'
                  >
                    <div className='flex min-w-0 items-center gap-2'>
                      <span className='shrink-0' aria-hidden>
                        {completed ? '✅' : '❌'}
                      </span>

                      <span className='min-w-0 break-words text-[var(--color-text)]'>
                        {item.label}
                      </span>
                    </div>

                    <span className='shrink-0 text-xs font-medium text-[var(--color-text-muted)]'>
                      +{item.points}%
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        </DialogContent>
      </Dialog>
    </header>
  );
}
