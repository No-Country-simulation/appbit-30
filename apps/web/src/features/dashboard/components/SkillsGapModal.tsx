'use client';

import { useTranslations } from 'next-intl';
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

export interface SkillRow {
  habilidad: string;
  estado: 'Adquirida' | 'En progreso' | 'Faltante';
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  puesto?: string;
  porcentaje?: number;
  skills?: SkillRow[];
  isLoading?: boolean;
}

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
    <div className='relative inline-flex shrink-0 items-center justify-center'>
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
  puesto,
  porcentaje,
  skills = [],
  isLoading = false,
}: Props) {
  const t = useTranslations('Dashboard');

  const hasGap = typeof porcentaje === 'number';
  const hasSkills = skills.length > 0;
  const resolvedPuesto = puesto ?? t('skillsGapFallbackPuesto');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='safe-modal-content flex max-h-[90dvh] w-[min(calc(100vw-1rem),32rem)] max-w-none flex-col overflow-hidden p-0'>
        <div className='shrink-0 border-b border-[var(--color-border)] px-4 py-4 sm:px-6'>
          <DialogHeader className='text-left'>
            <DialogTitle className='break-words leading-tight'>
              {t('skillsModalTitle', { puesto: resolvedPuesto })}
            </DialogTitle>

            <DialogDescription className='break-words leading-relaxed'>
              {t('skillsModalDesc')}
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className='min-w-0 flex-1 overflow-y-auto overflow-x-hidden px-4 py-4 sm:px-6'>
          {isLoading ? (
            <div className='flex flex-col items-center gap-4 py-6'>
              <div className='size-[104px] animate-pulse rounded-full bg-[var(--color-border)]' />
              <div className='h-4 w-52 max-w-full animate-pulse rounded bg-[var(--color-border)]' />
            </div>
          ) : hasGap && hasSkills ? (
            <>
              <div className='flex flex-col items-center gap-4 pb-4'>
                <CircularProgress value={porcentaje} />

                <p className='break-words text-center text-sm leading-relaxed text-[var(--color-text-muted)]'>
                  {t(porcentaje < 50 ? 'skillsModalBajo' : 'skillsModalAlto')}
                </p>
              </div>

              {/* Mobile: cards */}
              <div className='space-y-2 sm:hidden'>
                {skills.map((skill) => (
                  <div
                    key={skill.habilidad}
                    className='rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-card)] p-3'
                  >
                    <p className='break-words text-sm font-semibold leading-snug text-[var(--color-text)]'>
                      {skill.habilidad}
                    </p>

                    <div className='mt-2'>
                      <AppBadge variant={badgeVariant[skill.estado]}>
                        {skill.estado}
                      </AppBadge>
                    </div>
                  </div>
                ))}
              </div>

              {/* Tablet/Desktop: table */}
              <div className='hidden overflow-hidden rounded-[var(--radius-md)] border border-[var(--color-border)] sm:block'>
                <div className='max-h-[44dvh] overflow-y-auto overflow-x-hidden'>
                  <table className='w-full table-fixed text-sm'>
                    <thead className='sticky top-0 z-10'>
                      <tr className='bg-[var(--color-body)] text-left text-xs font-semibold text-[var(--color-text-muted)]'>
                        <th className='w-[65%] px-4 py-2.5'>
                          {t('habilidadRequerida')}
                        </th>

                        <th className='w-[35%] px-4 py-2.5'>{t('estado')}</th>
                      </tr>
                    </thead>

                    <tbody className='divide-y divide-[var(--color-border)]'>
                      {skills.map((skill) => (
                        <tr key={skill.habilidad}>
                          <td className='break-words px-4 py-2.5 font-medium leading-snug text-[var(--color-text)]'>
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
              </div>
            </>
          ) : (
            <p className='break-words py-6 text-center text-sm leading-6 text-[var(--color-text-muted)]'>
              {t('skillsModalEmptyDesc')}
            </p>
          )}
        </div>

        <DialogFooter className='shrink-0 border-t border-[var(--color-border)] px-4 py-4 sm:px-6 relative'>
          <AppButton variant='primary' className='w-full' disabled={!hasSkills}>
            {t('skillsModalButton')}
          </AppButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
