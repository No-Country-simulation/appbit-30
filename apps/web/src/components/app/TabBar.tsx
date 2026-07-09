'use client';

import { cn } from '@/lib/utils';

interface Tab {
  id: string;
  label: string;
  count?: number;
}

interface Props {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function TabBar({ tabs, activeTab, onTabChange }: Props) {
  return (
    <div className='flex gap-2 border-b border-[var(--color-border)]'>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={cn(
            'relative px-4 py-2.5 text-sm font-medium transition-colors',
            activeTab === tab.id
              ? 'text-[var(--color-primary)]'
              : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]',
          )}
        >
          {tab.label}
          {tab.count != null && (
            <span className='ml-1.5 rounded-full bg-[var(--color-primary-pale)] px-2 py-0.5 text-xs'>
              {tab.count}
            </span>
          )}
          {activeTab === tab.id && (
            <div className='absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--color-primary)]' />
          )}
        </button>
      ))}
    </div>
  );
}