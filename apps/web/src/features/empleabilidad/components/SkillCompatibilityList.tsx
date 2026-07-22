'use client';

import { useTranslations } from 'next-intl';
import { CheckCircle, Clock3, XCircle } from 'lucide-react';

interface Props {
  skills: {
    nombre: string;
    laTienes: boolean;
    progresoPorcentaje: number;
  }[];
}

export function SkillCompatibilityList({ skills }: Props) {
  const t = useTranslations('Empleabilidad');

  return (
    <div className='min-w-0 space-y-3'>
      {skills.map((skill) => (
        <div
          key={skill.nombre}
          className='flex min-w-0 flex-col gap-2 rounded-lg border border-[var(--color-border)] px-3 py-3 sm:flex-row sm:items-center sm:justify-between'
        >
          <div className='flex min-w-0 items-center gap-3'>
            {skill.laTienes ? (
              <CheckCircle className='size-5 shrink-0 text-[var(--color-success)]' />
            ) : skill.progresoPorcentaje > 0 ? (
              <Clock3 className='size-5 shrink-0 text-[var(--color-primary)]' />
            ) : (
              <XCircle className='size-5 shrink-0 text-[var(--color-danger)]' />
            )}

            <span className='min-w-0 break-words text-sm font-medium text-[var(--color-text)]'>
              {skill.nombre}
            </span>
          </div>

          <span
            className={`w-fit rounded-full px-3 py-1 text-xs font-semibold ${
              skill.laTienes
                ? 'bg-[var(--color-success-bg)] text-[var(--color-success-text)]'
                : skill.progresoPorcentaje > 0
                  ? 'bg-[var(--color-primary-pale)] text-[var(--color-primary)]'
                : 'bg-red-50 text-red-600'
            }`}
          >
            {skill.laTienes
              ? t('loTienes')
              : skill.progresoPorcentaje > 0
                ? t('skillEnProgreso', {
                    porcentaje: skill.progresoPorcentaje,
                  })
                : t('teFalta')}
          </span>
        </div>
      ))}
    </div>
  );
}
