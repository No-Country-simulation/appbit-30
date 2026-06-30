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
  onEmojiClick?: (moodId: string) => void;
  onHistorialClick?: () => void;
}

export function WellbeingCard({
  promedioSemanal = 3.6,
  onEmojiClick,
  onHistorialClick,
}: Props) {
  const t = useTranslations('Dashboard');

  const mensajeKey =
    promedioSemanal >= 7
      ? 'mensajeGenial'
      : promedioSemanal >= 5
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
            className='flex flex-col items-center gap-1 rounded-[var(--radius-md)] px-2 py-2 transition-all duration-200 hover:bg-[var(--color-primary-pale)] hover:scale-110'
          >
              <span className='text-2xl'>{item.emoji}</span>
              <span className='text-[10px] font-medium text-[var(--color-text-muted)]'>
                {t(item.key)}
              </span>
          </button>
        ))}
      </div>

      <div className='mt-auto border-t border-[var(--color-border)] pt-3'>
        <p className='text-center text-sm text-[var(--color-text-muted)]'>
          {t('promedioSemanal', { promedio: promedioSemanal.toString(), mensaje })}
        </p>
      </div>
    </AppCard>
  );
}
