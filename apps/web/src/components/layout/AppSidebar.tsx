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

const navItems = [
  { label: 'Inicio', icon: LayoutDashboard, href: '/dashboard' },
  { label: 'Empleos', icon: Briefcase, href: '#' },
  { label: 'Formación', icon: GraduationCap, href: '#' },
  { label: 'Experiencias', icon: Star, href: '#' },
  { label: 'Mentorías', icon: Users, href: '#' },
  { label: 'Bienestar', icon: Heart, href: '#' },
  { label: 'Mi Perfil', icon: User, href: '#' },
] as const;

export function AppSidebar() {
  return (
    <aside className='flex w-[var(--sidebar-width)] min-h-screen flex-col border-r border-[var(--color-border)] bg-[var(--color-card)]'>
      <div className='flex items-center gap-2 border-b border-[var(--color-border)] px-6 py-5'>
        <div className='flex size-8 items-center justify-center rounded-lg bg-[var(--color-primary)] text-sm font-black text-white'>
          B
        </div>
        <span className='font-heading text-lg font-black text-[var(--color-text)]'>
          Bi.T
        </span>
      </div>

      <nav className='flex-1 space-y-1 px-3 py-4'>
        {navItems.map((item) => (
          <a
            key={item.label}
            href={item.href}
            className={cn(
              'flex items-center gap-3 rounded-[var(--radius-md)] px-3 py-2.5 text-sm font-medium transition-colors duration-200',
              item.href === '/dashboard'
                ? 'bg-[var(--color-primary-pale)] text-[var(--color-primary)]'
                : 'text-[var(--color-text-muted)] hover:bg-[var(--color-primary-pale)] hover:text-[var(--color-primary)]',
            )}
          >
            <item.icon className='size-5' />
            {item.label}
          </a>
        ))}
      </nav>

      <div className='flex items-center gap-3 border-t border-[var(--color-border)] px-6 py-4'>
        <div className='flex size-10 items-center justify-center rounded-full bg-[var(--color-primary-pale)] text-sm font-bold text-[var(--color-primary)]'>
          M
        </div>
        <div className='flex flex-col'>
          <span className='text-sm font-medium text-[var(--color-text)]'>
            María López
          </span>
          <span className='text-xs text-[var(--color-text-muted)]'>
            maria@email.com
          </span>
        </div>
      </div>
    </aside>
  );
}
