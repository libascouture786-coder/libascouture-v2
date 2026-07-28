import { useState, type ReactNode } from 'react';

export type TabItem = {
  id: string;
  label: string;
  content: ReactNode;
};

type TabsProps = {
  tabs: TabItem[];
  defaultTab?: string;
  className?: string;
};

export function Tabs({ tabs, defaultTab, className = '' }: TabsProps) {
  const [active, setActive] = useState(defaultTab ?? tabs[0]?.id ?? '');
  const activeTab = tabs.find((t) => t.id === active);

  return (
    <div className={className}>
      <div className="border-b border-navy-100">
        <div className="flex gap-8 overflow-x-auto no-scrollbar">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActive(tab.id)}
              className={tab.id === active ? 'tab-btn-active' : 'tab-btn-inactive'}
            >
              {tab.label}
              {tab.id === active && <span className="tab-indicator" />}
            </button>
          ))}
        </div>
      </div>
      <div className="pt-8">{activeTab?.content}</div>
    </div>
  );
}
