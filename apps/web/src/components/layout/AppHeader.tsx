import { BellIcon } from 'lucide-react';
import { AppIcon, AppLanguageSwitcher } from '@/src/components';
import { AppButton } from '@/src/components/app/AppButton';
import { AppBadge } from '@/src/components/app/AppBadge';

interface Props {
  onMenuClick?: () => void;
  onCheckinClick?: () => void;
  profilePercent?: number;
}

export function AppHeader({
  onMenuClick,
  onCheckinClick,
  profilePercent = 80,
}: Props) {
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
              Perfil al {profilePercent}%
            </span>
            <div className='h-2 w-24 overflow-hidden rounded-full bg-[var(--color-border)]'>
              <div
                className='h-full rounded-full bg-[var(--color-success)] transition-all duration-500'
                style={{ width: `${profilePercent}%` }}
              />
            </div>
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
    </header>
  );
}
