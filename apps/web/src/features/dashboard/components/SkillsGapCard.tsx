import { AppButton } from '@/src/components/app/AppButton';
import { AppCard } from '@/src/components/app/AppCard';

interface Props {
  porcentaje?: number;
  puesto?: string;
  onVerDetalles?: () => void;
}

function CircularProgress({ value }: { value: number }) {
  const radius = 44;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div className='relative inline-flex items-center justify-center'>
      <svg width='104' height='104' className='-rotate-90'>
        <circle
          cx='52'
          cy='52'
          r={radius}
          fill='none'
          stroke='var(--color-border)'
          strokeWidth='8'
        />
        <circle
          cx='52'
          cy='52'
          r={radius}
          fill='none'
          stroke='var(--color-primary)'
          strokeWidth='8'
          strokeLinecap='round'
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className='transition-all duration-700'
        />
      </svg>
      <span className='absolute text-lg font-black text-[var(--color-primary)]'>
        {value}%
      </span>
    </div>
  );
}

export function SkillsGapCard({
  porcentaje = 40,
  puesto = 'Data Analyst',
  onVerDetalles,
}: Props) {
  return (
    <AppCard className='flex flex-col gap-4'>
      <div className='flex items-center justify-between'>
        <h3 className='font-heading text-base font-bold text-[var(--color-text)]'>
          Tu Brecha de Skills
        </h3>
      </div>

      <p className='text-sm text-[var(--color-text-muted)]'>
        Tenés el <strong>{porcentaje}%</strong> de las habilidades requeridas
        para <strong>{puesto}</strong>. Con los cursos sugeridos podrías cerrar
        la brecha en 3 meses.
      </p>

      <div className='flex items-center gap-6'>
        <CircularProgress value={porcentaje} />

        <div className='space-y-1.5'>
          {[
            { label: 'Adquiridas', color: 'var(--color-success)' },
            { label: 'En progreso', color: 'var(--color-secondary)' },
            { label: 'Faltantes', color: 'var(--color-border)' },
          ].map((item) => (
            <div key={item.label} className='flex items-center gap-2 text-xs'>
              <span
                className='size-2.5 rounded-full'
                style={{ backgroundColor: item.color }}
              />
              <span className='text-[var(--color-text-muted)]'>
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      <AppButton variant='primary' className='w-full' onClick={onVerDetalles}>
        Ver Análisis Detallado
      </AppButton>
    </AppCard>
  );
}
