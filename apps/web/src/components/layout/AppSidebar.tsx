'use client';

import { useTranslations } from 'next-intl';
import {
  LayoutDashboard,
  Briefcase,
  GraduationCap,
  Star,
  Users,
  Heart,
  User,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navGroups = [
  [
    { label: 'Inicio', icon: LayoutDashboard, href: '/dashboard' },
    { label: 'Empleos', icon: Briefcase, href: '#' },
    { label: 'Formación', icon: GraduationCap, href: '#' },
  ],
  [
    { label: 'Experiencias', icon: Star, href: '#' },
    { label: 'Mentorías', icon: Users, href: '#' },
  ],
  [{ label: 'Bienestar', icon: Heart, href: '#' }],
];

export function AppSidebar() {
  const t = useTranslations('Dashboard');

  return (
    <aside className='flex w-[var(--sidebar-width)] min-h-screen flex-col border-r border-[var(--color-border)] bg-[var(--color-card)]'>
      <div className='flex items-center gap-2 border-b border-[var(--color-border)] px-6 py-5'>
        <span className='font-heading text-lg font-black text-[var(--color-text)]'>
          Bi.T
        </span>
      </div>

      <nav className='flex-1 px-4 py-3'>
        {navGroups.map((group, groupIndex) => (
          <div key={groupIndex}>
            {groupIndex > 0 && (
              <div className='my-3 border-t border-[var(--color-border)]' />
            )}
            <ul className='space-y-1.5'>
              {group.map((item) => (
                <li key={item.label}>
                  <a
                    href={item.href}
                    className={cn(
                      'flex items-center gap-3 rounded-[var(--radius-md)] px-4 py-2.5 text-sm font-medium transition-all duration-200',
                      item.href === '/dashboard'
                        ? 'bg-[var(--color-primary)] text-white'
                        : 'text-[var(--color-text-muted)] hover:bg-[var(--color-primary-pale)] hover:text-[var(--color-primary)] hover:pl-5',
                    )}
                  >
                    <item.icon className='size-5 shrink-0' />
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      <div className='border-t border-[var(--color-border)] px-4 py-3'>
        <a
          href='#'
          className='flex items-center gap-3 rounded-[var(--radius-md)] px-4 py-2.5 text-sm font-medium text-[var(--color-text-muted)] transition-all duration-200 hover:bg-[var(--color-primary-pale)] hover:text-[var(--color-primary)] hover:pl-5'
        >
          <User className='size-5 shrink-0' />
          Mi Perfil
        </a>
      </div>

      <div className='flex items-center gap-3 border-t border-[var(--color-border)] px-6 py-4'>
        <div className='flex size-10 items-center justify-center rounded-full bg-[var(--color-primary-pale)] text-sm font-bold text-[var(--color-primary)]'>
          M
        </div>
        <div className='flex flex-col'>
          <span className='text-sm font-medium text-[var(--color-text)]'>
            María Pérez
          </span>
          <span className='text-xs text-[var(--color-text-muted)]'>
            Ver perfil
          </span>
        </div>
      </div>
    </aside>
  );
}
