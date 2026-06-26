import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/src/components/ui/dialog';
import { AppBadge } from '@/src/components/app/AppBadge';
import { AppButton } from '@/src/components/app/AppButton';

interface SkillRow {
  habilidad: string;
  estado: 'Adquirida' | 'En progreso' | 'Faltante';
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  puesto?: string;
  porcentaje?: number;
  skills?: SkillRow[];
}

const defaultSkills: SkillRow[] = [
  { habilidad: 'SQL', estado: 'Adquirida' },
  { habilidad: 'Python', estado: 'En progreso' },
  { habilidad: 'Power BI', estado: 'Faltante' },
  { habilidad: 'Tableau', estado: 'Faltante' },
  { habilidad: 'Estadística', estado: 'Adquirida' },
  { habilidad: 'Machine Learning', estado: 'En progreso' },
];

const badgeVariant = {
  Adquirida: 'success' as const,
  'En progreso': 'warning' as const,
  Faltante: 'danger' as const,
};

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

export function SkillsGapModal({
  open,
  onOpenChange,
  puesto = 'Data Analyst',
  porcentaje = 40,
  skills = defaultSkills,
}: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>Análisis de Brecha: {puesto}</DialogTitle>
          <DialogDescription>
            Comparativa de tus habilidades actuales vs. las requeridas para el
            puesto.
          </DialogDescription>
        </DialogHeader>

        <div className='flex flex-col items-center gap-4 py-4'>
          <CircularProgress value={porcentaje} />

          <p className='text-center text-sm text-[var(--color-text-muted)]'>
            {porcentaje < 50
              ? 'Todavía falta camino, pero con los cursos adecuados podés cerrar la brecha.'
              : 'Vas bien encaminado, seguí así.'}
          </p>
        </div>

        <div className='overflow-hidden rounded-[var(--radius-md)] border border-[var(--color-border)]'>
          <table className='w-full text-sm'>
            <thead>
              <tr className='bg-[var(--color-body)] text-left text-xs font-semibold text-[var(--color-text-muted)]'>
                <th className='px-4 py-2.5'>Habilidad Requerida</th>
                <th className='px-4 py-2.5'>Estado</th>
              </tr>
            </thead>
            <tbody className='divide-y divide-[var(--color-border)]'>
              {skills.map((skill) => (
                <tr key={skill.habilidad}>
                  <td className='px-4 py-2.5 font-medium text-[var(--color-text)]'>
                    {skill.habilidad}
                  </td>
                  <td className='px-4 py-2.5'>
                    <AppBadge variant={badgeVariant[skill.estado]}>
                      {skill.estado}
                    </AppBadge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <DialogFooter>
          <AppButton variant='primary' className='w-full'>
            Ir a Formación para mejorar
          </AppButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
