'use client';

import { useTranslations } from 'next-intl';
import { AppCard } from '@/src/components/app/AppCard';
import { cn } from '@/lib/utils';

const emojis = [
  { id: 'agotado', emoji: '😩', key: 'moodAgotado' },
  { id: 'triste', emoji: '😢', key: 'moodTriste' },
  { id: 'neutral', emoji: '😐', key: 'moodNeutral' },
  { id: 'bien', emoji: '🙂', key: 'moodBien' },
  { id: 'genial', emoji: '😄', key: 'moodGenial' },
];

interface TodayCheckin {
  checkin_id: string;
  emoji: string;
  nota_diaria: number;
  creado_en: string;
}

interface Props {
  promedioSemanal?: number;
  isLoading?: boolean;
  hasCheckinToday?: boolean;
  todayCheckin?: TodayCheckin | null;
  onEmojiClick?: (moodId: string) => void;
  onHistorialClick?: () => void;
}

export function WellbeingCard({
  promedioSemanal,
  isLoading = false,
  hasCheckinToday = false,
  todayCheckin = null,
  onEmojiClick,
  onHistorialClick,
}: Props) {
  const t = useTranslations('Dashboard');

  const promedio = promedioSemanal ?? 0;

  const mensajeKey =
    promedio >= 7
      ? 'mensajeGenial'
      : promedio >= 5
        ? 'mensajeBien'
        : 'mensajeRegular';

  const mensaje = t(mensajeKey);

  const selectedEmoji = todayCheckin
    ? emojis.find((item) => item.id === todayCheckin.emoji)
    : null;

  return (
    <AppCard className='flex flex-col gap-4'>
      <div className='flex items-center justify-between gap-3'>
        <h3 className='font-heading text-base font-bold text-[var(--color-text)]'>
          {t('wellbeingTitle')}
        </h3>

        <button
          type='button'
          onClick={onHistorialClick}
          className='shrink-0 text-xs font-medium text-[var(--color-primary)] transition-colors hover:text-[var(--color-primary-dark)]'
        >
          {t('historial')}
        </button>
      </div>

      <p className='text-sm text-[var(--color-text-muted)]'>
        {hasCheckinToday ? t('checkinAlreadyDoneToday') : t('wellbeingDesc')}
      </p>

      {hasCheckinToday && selectedEmoji && (
        <div className='rounded-[var(--radius-md)] border border-[var(--color-success)] bg-[var(--color-success-bg)] px-3 py-2 text-sm text-[var(--color-success-text)]'>
          {t('todayCheckinRegistered', {
            mood: t(selectedEmoji.key),
          })}
        </div>
      )}

      <div className='flex justify-between gap-1'>
        {emojis.map((item) => {
          const isSelectedToday = selectedEmoji?.id === item.id;

          return (
            <button
              key={item.id}
              type='button'
              disabled={isLoading || hasCheckinToday}
              onClick={() => onEmojiClick?.(item.id)}
              className={cn(
                'flex min-w-0 flex-1 flex-col items-center gap-1 rounded-[var(--radius-md)] px-1.5 py-2 transition-all duration-200',
                hasCheckinToday || isLoading
                  ? 'cursor-not-allowed opacity-45'
                  : 'hover:scale-105 hover:bg-[var(--color-primary-pale)]',
                isSelectedToday &&
                  'opacity-100 ring-2 ring-[var(--color-success)] ring-offset-2 ring-offset-[var(--color-card)]',
              )}
            >
              <span className='text-2xl'>{item.emoji}</span>

              <span className='max-w-full truncate text-[10px] font-medium text-[var(--color-text-muted)]'>
                {t(item.key)}
              </span>
            </button>
          );
        })}
      </div>

      <div className='mt-auto border-t border-[var(--color-border)] pt-3'>
        {isLoading ? (
          <div className='mx-auto h-4 w-44 animate-pulse rounded bg-[var(--color-border)]' />
        ) : (
          <p className='text-center text-sm text-[var(--color-text-muted)]'>
            {t('promedioSemanal', {
              promedio: promedio.toString().slice(0, 4),
              mensaje: promedio ? mensaje : '',
            })}
          </p>
        )}
      </div>
    </AppCard>
  );
}
