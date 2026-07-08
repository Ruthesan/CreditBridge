import { useState, type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

interface Tab {
  key: string;
  label: string;
  icon?: ReactNode;
}

export function Tabs({
  tabs,
  value,
  onChange,
  className,
}: {
  tabs: Tab[];
  value?: string;
  onChange?: (key: string) => void;
  className?: string;
}) {
  const [internal, setInternal] = useState(tabs[0]?.key);
  const active = value ?? internal;

  function select(key: string) {
    setInternal(key);
    onChange?.(key);
  }

  return (
    <div
      role="tablist"
      className={cn('inline-flex items-center gap-1 rounded-xl bg-gray-100 p-1', className)}
    >
      {tabs.map((tab) => (
        <button
          key={tab.key}
          role="tab"
          aria-selected={active === tab.key}
          onClick={() => select(tab.key)}
          className={cn(
            'relative flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-sm font-medium transition-colors',
            active === tab.key ? 'text-ink' : 'text-ink-secondary hover:text-ink'
          )}
        >
          {active === tab.key && (
            <motion.span
              layoutId="tab-pill"
              className="absolute inset-0 rounded-lg bg-white shadow-card"
              transition={{ type: 'spring', stiffness: 500, damping: 35 }}
            />
          )}
          <span className="relative z-10 flex items-center gap-1.5">
            {tab.icon}
            {tab.label}
          </span>
        </button>
      ))}
    </div>
  );
}
