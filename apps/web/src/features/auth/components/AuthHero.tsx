import { useTranslations } from 'next-intl';
import { AuthAvatarStack } from './AuthAvatarStack';
import Image from 'next/image';

export function AuthHero() {
  const t = useTranslations('Auth');

  return (
    <section className='relative hidden min-h-screen overflow-hidden bg-[var(--color-dark-surface)] lg:block'>
      <Image
        src='/auth/auth-hero.png'
        alt='auth-hero'
        width={500}
        height={500}
        className='absolute inset-0 h-full w-full object-cover opacity-50'
      />

      <div className='absolute inset-0 bg-[#1f1646]/75' />

      <div className='relative z-10 flex h-full flex-col justify-center px-12 xl:px-16'>
        <div className='max-w-xl space-y-8'>
          <div className='space-y-4'>
            <h1 className='font-heading text-5xl font-black leading-tight text-white xl:text-6xl'>
              {t('heroTitleLine1')}
              <br />
              <span className='text-[var(--color-secondary)]'>
                {t('heroTitleLine2')}
              </span>
            </h1>

            <p className='max-w-md font-body text-base font-medium leading-7 text-white/85'>
              {t('heroDescription')}
            </p>
          </div>

          <div className='flex items-center gap-4'>
            <AuthAvatarStack />

            <div className='font-body text-sm text-white'>
              <strong>{t('profilesStrong')}</strong>
              <br />
              <span className='text-white/70'>{t('profilesText')}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
