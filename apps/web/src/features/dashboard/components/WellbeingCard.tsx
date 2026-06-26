import { AppCard } from '@/src/components/app/AppCard';

const emojis = [
  { id: 'agotado', emoji: '😩', label: 'Agobio' },
  { id: 'triste', emoji: '😢', label: 'Triste' },
  { id: 'neutral', emoji: '😐', label: 'Neutral' },
  { id: 'bien', emoji: '🙂', label: 'Bien' },
  { id: 'genial', emoji: '😄', label: 'Genial' },
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
  return (
    <AppCard className='flex flex-col gap-4'>
      <div className='flex items-center justify-between'>
        <h3 className='font-heading text-base font-bold text-[var(--color-text)]'>
          ¿Cómo te sentís hoy?
        </h3>
        <button
          type='button'
          onClick={onHistorialClick}
          className='text-xs font-medium text-[var(--color-primary)] transition-colors hover:text-[var(--color-primary-dark)]'
        >
          Historial
        </button>
      </div>

      <p className='text-sm text-[var(--color-text-muted)]'>
        Elegí tu estado actual para personalizar tus sugerencias diarias:
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
              {item.label}
            </span>
          </button>
        ))}
      </div>

      <div className='mt-auto border-t border-[var(--color-border)] pt-3'>
        <p className='text-center text-sm text-[var(--color-text-muted)]'>
          Promedio semanal: <strong className='text-[var(--color-text)]'>{promedioSemanal}</strong>.{' '}
          {promedioSemanal >= 7
            ? '¡Genial!'
            : promedioSemanal >= 5
              ? '¡Venís muy bien!'
              : 'Seguí mejorando'}
        </p>
      </div>
    </AppCard>
  );
}
