import { AppIcon } from '@/src/components';

interface Props {
  onMenuClick?: () => void;
}

export function AppHeader({ onMenuClick }: Props) {
  return (
    <header className='flex h-16 items-center justify-between border-b border-[var(--color-border)] bg-[var(--color-card)] px-4 sm:px-6'>
      <button
        type='button'
        aria-label='Abrir menú'
        onClick={onMenuClick}
        className='inline-flex size-10 items-center justify-center rounded-[var(--radius-sm)] border border-[var(--color-border)] text-[var(--color-text)] lg:hidden'
      >
        <AppIcon name='menu' className='size-5' />
      </button>

      <div className='hidden lg:block'>Header</div>
    </header>
  );
}
