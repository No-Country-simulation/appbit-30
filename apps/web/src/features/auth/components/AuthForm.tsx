'use client';

import { FormEvent, useMemo, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { AppButton, AppIcon, AppInput } from '@/src/components';
import { createClient } from '@/src/lib/supabase/client';
import { AuthDivider } from './AuthDivider';

type AuthStatus =
  | 'idle'
  | 'loading-email'
  | 'email-sent'
  | 'loading-google'
  | 'error';

type Props = {
  initialError?: string;
};

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function AuthForm({ initialError }: Props) {
  const t = useTranslations('Auth');
  const locale = useLocale();
  const supabase = useMemo(() => createClient(), []);

  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<AuthStatus>(
    initialError ? 'error' : 'idle',
  );
  const [errorMessage, setErrorMessage] = useState(() => {
    if (initialError === 'missing_code') return t('callbackMissingCode');
    if (initialError === 'callback_failed') return t('callbackFailed');
    return '';
  });

  const emailIsValid = isValidEmail(email);
  const isLoading = status === 'loading-email' || status === 'loading-google';

  async function handleEmailLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!emailIsValid) {
      setStatus('error');
      setErrorMessage(t('invalidEmail'));
      return;
    }

    setStatus('loading-email');
    setErrorMessage('');

    const redirectTo = `${window.location.origin}/${locale}/auth/callback`;

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: redirectTo,
        shouldCreateUser: true,
      },
    });

    if (error) {
      setStatus('error');
      setErrorMessage(t('emailError'));
      return;
    }

    setStatus('email-sent');
  }

  async function handleGoogleLogin() {
    setStatus('loading-google');
    setErrorMessage('');

    const redirectTo = `${window.location.origin}/${locale}/auth/callback`;

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo,
      },
    });

    if (error) {
      setStatus('error');
      setErrorMessage(t('googleError'));
    }
  }

  if (status === 'email-sent') {
    return (
      <div className='space-y-6'>
        <AuthBrand />

        <div className='space-y-2'>
          <h1 className='font-heading text-2xl font-black text-[var(--color-text)]'>
            {t('checkEmailTitle')}
          </h1>

          <p className='font-body text-sm leading-6 text-[var(--color-text-muted)]'>
            {t('checkEmailDescription', { email })}
          </p>
        </div>

        <AppButton
          type='button'
          variant='outline'
          className='flex w-full justify-center'
          onClick={() => {
            setStatus('idle');
            setErrorMessage('');
            setEmail('');
          }}
        >
          {t('useAnotherEmail')}
        </AppButton>
      </div>
    );
  }

  return (
    <div className='space-y-7'>
      <AuthBrand />

      <div className='space-y-1'>
        <h1 className='font-heading text-2xl font-black text-[var(--color-text)]'>
          {t('title')}
        </h1>

        <p className='font-body text-sm text-[var(--color-text-muted)]'>
          {t('subtitle')}
        </p>
      </div>

      <form className='space-y-4' onSubmit={handleEmailLogin}>
        <div className='space-y-2'>
          <label
            htmlFor='email'
            className='font-body text-sm font-semibold text-[var(--color-text)]'
          >
            {t('emailLabel')}
          </label>

          <AppInput
            id='email'
            type='email'
            inputMode='email'
            autoComplete='email'
            placeholder={t('emailPlaceholder')}
            value={email}
            disabled={isLoading}
            onChange={(event) => {
              setEmail(event.target.value);

              if (errorMessage) {
                setErrorMessage('');
                setStatus('idle');
              }
            }}
          />
        </div>

        {errorMessage && (
          <div
            role='alert'
            className='rounded-[var(--radius-sm)] bg-[var(--color-danger-bg)] px-4 py-3'
          >
            <p className='font-body text-sm font-medium text-[var(--color-danger-text)]'>
              {errorMessage}
            </p>
          </div>
        )}

        <AppButton
          type='submit'
          className='flex w-full justify-center'
          disabled={isLoading || !email}
        >
          {status === 'loading-email'
            ? t('sendingAccess')
            : t('continueWithEmail')}
        </AppButton>
      </form>

      <AuthDivider />

      <AppButton
        type='button'
        variant='outline'
        className='flex w-full items-center justify-center gap-2'
        disabled={isLoading}
        onClick={handleGoogleLogin}
      >
        <AppIcon name='google' className='size-4 text-[var(--color-danger)]' />

        {status === 'loading-google'
          ? t('redirecting')
          : t('continueWithGoogle')}
      </AppButton>

      <p className='text-center font-body text-xs leading-5 text-[var(--color-text-muted)]'>
        {t('termsSentence')}
      </p>
    </div>
  );
}

function AuthBrand() {
  return (
    <div className='font-heading text-2xl font-black tracking-wide text-[var(--color-text)]'>
      Bi<span className='text-[var(--color-secondary)]'>.</span>T
    </div>
  );
}
