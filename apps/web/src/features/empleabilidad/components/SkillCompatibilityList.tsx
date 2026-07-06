'use client';

import { useTranslations } from 'next-intl';
import { CheckCircle, XCircle } from 'lucide-react';

interface Props {
  skills: { nombre: string; laTienes: boolean }[];
}

export function SkillCompatibilityList({ skills }: Props) {
  const t = useTranslations('Empleabilidad');

  return (
    <div className='space-y-3'>
      {skills.map((skill) => (
        <div
          key={skill.nombre}
          className='flex items-center justify-between'
        >
          <div className='flex items-center gap-3'>
            {skill.laTienes ? (
              <CheckCircle className='size-5 text-[var(--color-success)]' />
            ) : (
              <XCircle className='size-5 text-[var(--color-danger)]' />
            )}
            <span className='text-sm font-medium text-[var(--color-text)]'>
              {skill.nombre}
            </span>
          </div>
          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold ${
              skill.laTienes
                ? 'bg-[var(--color-success-bg)] text-[var(--color-success-text)]'
                : 'bg-red-50 text-red-600'
            }`}
          >
            {skill.laTienes ? t('loTienes') : t('teFalta')}
          </span>
        </div>
      ))}
    </div>
  );
}
