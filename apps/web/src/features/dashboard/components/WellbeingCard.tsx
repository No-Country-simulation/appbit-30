import { HistoryIcon } from 'lucide-react';
import { AppCard } from '@/src/components/app/AppCard';

const emojis = [
  { emoji: '😩', label: 'Agotado' },
  { emoji: '😢', label: 'Triste' },
  { emoji: '😐', label: 'Neutral' },
  { emoji: '🙂', label: 'Bien' },
  { emoji: '😄', label: 'Genial' },
];

interface Props {
  promedioSemanal?: number;
}

export function WellbeingCard({ promedioSemanal = 6.5 }: Props) {
  return (
    <AppCard className='flex flex-col gap-4'>
      <h3 className='font-heading text-base font-bold text-[var(--color-text)]'>
        ¿Cómo te sentís hoy?
      </h3>

      <div className='flex justify-between'>
        {emojis.map((item) => (
          <button
            key={item.label}
            type='button'
            className='flex flex-col items-center gap-1 rounded-[var(--radius-md)] px-2 py-2 transition-all duration-200 hover:bg-[var(--color-primary-pale)] hover:scale-110'
          >
            <span className='text-2xl'>{item.emoji}</span>
            <span className='text-[10px] font-medium text-[var(--color-text-muted)]'>
              {item.label}
            </span>
          </button>
        ))}
      </div>

      <div className='flex items-center justify-between rounded-[var(--radius-md)] bg-[var(--color-body)] px-4 py-2.5'>
        <span className='text-xs text-[var(--color-text-muted)]'>
          Promedio semanal
        </span>
        <div className='flex items-center gap-2'>
          <div className='flex items-center gap-1'>
            <div className='h-1.5 w-16 overflow-hidden rounded-full bg-[var(--color-border)]'>
              <div
                className='h-full rounded-full bg-[var(--color-success)]'
                style={{ width: `${promedioSemanal * 10}%` }}
              />
            </div>
            <span className='text-xs font-semibold text-[var(--color-text)]'>
              {promedioSemanal}/10
            </span>
          </div>

          <button
            type='button'
            className='ml-2 flex items-center gap-1 text-xs font-medium text-[var(--color-primary)] transition-colors hover:text-[var(--color-primary-dark)]'
          >
            <HistoryIcon className='size-3.5' />
            Historial
          </button>
        </div>
      </div>
    </AppCard>
  );
}
