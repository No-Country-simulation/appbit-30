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
  return (
    <aside className='flex w-[var(--sidebar-width)] min-h-screen flex-col border-r border-[var(--color-border)] bg-[var(--color-card)]'>
      <div className='flex items-center gap-2 border-b border-[var(--color-border)] px-6 py-5'>
        <span className='font-heading text-lg font-black text-[var(--color-text)]'>
          Bi.T
        </span>
      </div>

      <div className='px-4 py-3'>
        <div className='rounded-[var(--radius-md)] bg-[#f5c542] px-4 py-3 text-center'>
          <p className='text-xs font-bold uppercase tracking-wide text-[#1a1a2e]'>
            Match de Perfil
          </p>
          <p className='text-xs text-[#1a1a2e]/70'>Completado: 85%</p>
        </div>
      </div>

      <nav className='flex-1 px-3 py-2'>
        {navGroups.map((group, groupIndex) => (
          <div key={groupIndex}>
            {groupIndex > 0 && (
              <div className='my-2 border-t border-[var(--color-border)]' />
            )}
            <ul className='space-y-0.5'>
              {group.map((item) => (
                <li key={item.label}>
                  <a
                    href={item.href}
                    className={cn(
                      'flex items-center gap-3 rounded-[var(--radius-md)] px-3 py-2.5 text-sm font-medium transition-colors duration-200',
                      item.href === '/dashboard'
                        ? 'bg-[var(--color-primary)] text-white'
                        : 'text-[var(--color-text-muted)] hover:bg-[var(--color-primary-pale)] hover:text-[var(--color-primary)]',
                    )}
                  >
                    <item.icon className='size-5' />
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      <div className='border-t border-[var(--color-border)] px-3 py-2'>
        <a
          href='#'
          className='flex items-center gap-3 rounded-[var(--radius-md)] px-3 py-2.5 text-sm font-medium text-[var(--color-text-muted)] transition-colors duration-200 hover:bg-[var(--color-primary-pale)] hover:text-[var(--color-primary)]'
        >
          <User className='size-5' />
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
