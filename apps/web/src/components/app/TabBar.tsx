'use client';

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
    <div className='flex gap-1 border-b border-[var(--color-border)]'>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`px-4 py-2.5 text-sm font-medium transition-colors ${
            activeTab === tab.id
              ? 'border-b-2 border-[var(--color-primary)] text-[var(--color-primary)]'
              : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
          }`}
        >
          {tab.label}
          {tab.count != null && (
            <span className='ml-0.5'>
              ({tab.count})
            </span>
          )}
        </button>
      ))}
    </div>
  );
}