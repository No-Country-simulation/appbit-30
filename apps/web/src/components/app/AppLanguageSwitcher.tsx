'use client';

import { useLocale, useTranslations } from 'next-intl';
import { usePathname, useRouter } from '@/src/i18n/navigation';

export function AppLanguageSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const t = useTranslations('Common');

  function handleChange(nextLocale: string) {
    router.replace(pathname, { locale: nextLocale });
  }

  return (
    <div className='flex items-center gap-2'>
      <span className='font-body text-sm font-medium text-[var(--color-text-muted)]'>
        {t('language')}
      </span>

      <select
        value={locale}
        onChange={(event) => handleChange(event.target.value)}
        className='rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-card)] px-3 py-2 font-body text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-primary)] focus:ring-[3px] focus:ring-[var(--color-input-focus-ring)]'
      >
        <option value='es'>{t('spanish')}</option>
        <option value='pt'>{t('portuguese')}</option>
      </select>
    </div>
  );
}
