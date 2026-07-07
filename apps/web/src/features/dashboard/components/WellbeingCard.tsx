'use client';

import { useTranslations } from 'next-intl';
import { AppCard } from '@/src/components/app/AppCard';

const emojis = [
  { id: 'agotado', emoji: '😩', key: 'moodAgotado' },
  { id: 'triste', emoji: '😢', key: 'moodTriste' },
  { id: 'neutral', emoji: '😐', key: 'moodNeutral' },
  { id: 'bien', emoji: '🙂', key: 'moodBien' },
  { id: 'genial', emoji: '😄', key: 'moodGenial' },
];

interface Props {
  promedioSemanal?: number;
  isLoading?: boolean;
  onEmojiClick?: (moodId: string) => void;
  onHistorialClick?: () => void;
}

export function WellbeingCard({
  promedioSemanal,
  isLoading = false,
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

  return (
    <AppCard className='flex flex-col gap-4'>
      <div className='flex items-center justify-between'>
        <h3 className='font-heading text-base font-bold text-[var(--color-text)]'>
          {t('wellbeingTitle')}
        </h3>

        <button
          type='button'
          onClick={onHistorialClick}
          className='text-xs font-medium text-[var(--color-primary)] transition-colors hover:text-[var(--color-primary-dark)]'
        >
          {t('historial')}
        </button>
      </div>

      <p className='text-sm text-[var(--color-text-muted)]'>
        {t('wellbeingDesc')}
      </p>

      <div className='flex justify-between'>
        {emojis.map((item) => (
          <button
            key={item.id}
            type='button'
            onClick={() => onEmojiClick?.(item.id)}
            className='flex flex-col items-center gap-1 rounded-[var(--radius-md)] px-2 py-2 transition-all duration-200 hover:scale-110 hover:bg-[var(--color-primary-pale)]'
          >
            <span className='text-2xl'>{item.emoji}</span>

            <span className='text-[10px] font-medium text-[var(--color-text-muted)]'>
              {t(item.key)}
            </span>
          </button>
        ))}
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
