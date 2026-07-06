'use client';

import { useTranslations } from 'next-intl';
import { AppBadge } from '@/src/components/app/AppBadge';

interface Props {
  skills: { nombre: string; laTienes: boolean }[];
}

export function SkillCompatibilityList({ skills }: Props) {
  const t = useTranslations('Empleabilidad');

  return (
    <div className='space-y-2'>
      {skills.map((skill) => (
        <div
          key={skill.nombre}
          className='flex items-center justify-between rounded-lg border border-[var(--color-border)] px-4 py-3'
        >
          <div className='flex items-center gap-3'>
            <span className='text-lg'>{skill.laTienes ? '✅' : '❌'}</span>
            <span className='text-sm font-medium text-[var(--color-text)]'>
              {skill.nombre}
            </span>
          </div>
          <AppBadge variant={skill.laTienes ? 'success' : 'danger'}>
            {skill.laTienes ? t('loTienes') : t('teFalta')}
          </AppBadge>
        </div>
      ))}
    </div>
  );
}
