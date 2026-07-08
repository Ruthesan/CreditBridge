import { useRef, useState, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useClickOutside } from '../../hooks/useClickOutside';
import { cn } from '../../lib/utils';

interface DropdownItem {
  key: string;
  label: ReactNode;
  icon?: ReactNode;
  onSelect: () => void;
  danger?: boolean;
}

export function Dropdown({
  trigger,
  items,
  align = 'right',
}: {
  trigger: ReactNode;
  items: DropdownItem[];
  align?: 'left' | 'right';
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useClickOutside(ref, () => setOpen(false), open);

  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen((o) => !o)} aria-haspopup="menu" aria-expanded={open}>
        {trigger}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            role="menu"
            initial={{ opacity: 0, y: -4, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.97 }}
            transition={{ duration: 0.14 }}
            className={cn(
              'absolute top-full z-50 mt-2 w-56 overflow-hidden rounded-xl border border-line bg-white p-1.5 shadow-soft',
              align === 'right' ? 'right-0' : 'left-0'
            )}
          >
            {items.map((item) => (
              <button
                key={item.key}
                role="menuitem"
                onClick={() => {
                  item.onSelect();
                  setOpen(false);
                }}
                className={cn(
                  'flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors',
                  item.danger ? 'text-danger hover:bg-danger-50' : 'text-ink hover:bg-surface'
                )}
              >
                {item.icon}
                {item.label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
