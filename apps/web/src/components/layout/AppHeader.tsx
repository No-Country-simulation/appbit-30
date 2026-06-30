'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { BellIcon, Info } from 'lucide-react';
import { AppIcon, AppLanguageSwitcher } from '@/src/components';
import { AppButton } from '@/src/components/app/AppButton';
import { AppBadge } from '@/src/components/app/AppBadge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/src/components/ui/dialog';

interface Props {
  onMenuClick?: () => void;
  onCheckinClick?: () => void;
  profilePercent?: number;
  perfilBreakdown?: {
    onboarding: boolean;
    movilidad: boolean;
    avatar: boolean;
    ubicacion: boolean;
    whatsapp: boolean;
  };
}

export function AppHeader({
  onMenuClick,
  onCheckinClick,
  profilePercent = 80,
  perfilBreakdown,
}: Props) {
  const t = useTranslations('Dashboard');
  const [breakdownOpen, setBreakdownOpen] = useState(false);

  const items = perfilBreakdown
    ? [
        { key: 'onboarding', label: t('perfilBreakdownOnboarding'), points: 50 },
        { key: 'movilidad', label: t('perfilBreakdownMovilidad'), points: 20 },
        { key: 'avatar', label: t('perfilBreakdownAvatar'), points: 10 },
        { key: 'ubicacion', label: t('perfilBreakdownUbicacion'), points: 10 },
        { key: 'whatsapp', label: t('perfilBreakdownWhatsapp'), points: 10 },
      ]
    : [];

  return (
    <header className='flex h-16 items-center justify-between gap-4 border-b border-[var(--color-border)] bg-[var(--color-card)] px-4 sm:px-6'>
      <div className='flex items-center gap-3'>
        <button
          type='button'
          aria-label='Abrir menú'
          onClick={onMenuClick}
          className='inline-flex size-10 items-center justify-center rounded-[var(--radius-sm)] border border-[var(--color-border)] text-[var(--color-text)] lg:hidden'
        >
          <AppIcon name='menu' className='size-5' />
        </button>

        <div className='hidden items-center gap-3 lg:flex'>
          <div className='flex items-center gap-2'>
            <span className='whitespace-nowrap text-xs font-semibold text-[var(--color-success-text)]'>
              {t('perfilProgreso', { porcentaje: profilePercent.toString() })}
            </span>
            <div className='h-2 w-24 overflow-hidden rounded-full bg-[var(--color-border)]'>
              <div
                className='h-full rounded-full bg-[var(--color-success)] transition-all duration-500'
                style={{ width: `${profilePercent}%` }}
              />
            </div>
            <button
              type='button'
              onClick={() => setBreakdownOpen(true)}
              className='inline-flex size-5 items-center justify-center text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
            >
              <Info className='size-4' />
            </button>
          </div>
        </div>
      </div>

      <div className='flex items-center gap-2'>
        <AppBadge variant='warning'>Offline sugerido</AppBadge>

        <AppButton
          variant='primary'
          className='!hidden !px-4 !py-2 text-xs sm:!inline-flex'
          onClick={onCheckinClick}
        >
          Check-in
        </AppButton>

        <button
          type='button'
          aria-label='Notificaciones'
          className='inline-flex size-10 items-center justify-center rounded-[var(--radius-sm)] text-[var(--color-text-muted)] transition-colors hover:bg-[var(--color-primary-pale)] hover:text-[var(--color-primary)]'
        >
          <BellIcon className='size-5' />
        </button>

        <AppLanguageSwitcher />
      </div>

      <Dialog open={breakdownOpen} onOpenChange={setBreakdownOpen}>
        <DialogContent className='sm:max-w-xs'>
          <DialogHeader>
            <DialogTitle>{t('perfilBreakdownTitle')}</DialogTitle>
          </DialogHeader>
          <ul className='space-y-2 text-sm'>
            {items.map((item) => (
              <li key={item.key} className='flex items-center gap-2'>
                <span>{perfilBreakdown?.[item.key as keyof typeof perfilBreakdown] ? '✅' : '❌'}</span>
                <span className='flex-1 text-[var(--color-text)]'>{item.label}</span>
                <span className='text-xs text-[var(--color-text-muted)]'>+{item.points}%</span>
              </li>
            ))}
          </ul>
        </DialogContent>
      </Dialog>
    </header>
  );
}
