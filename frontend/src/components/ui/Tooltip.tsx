import { useId, useState, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '../../lib/utils';

export function Tooltip({
  content,
  children,
  side = 'top',
}: {
  content: ReactNode;
  children: ReactNode;
  side?: 'top' | 'bottom';
}) {
  const [open, setOpen] = useState(false);
  const id = useId();

  return (
    <span
      className="relative inline-flex"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={() => setOpen(false)}
    >
      <span aria-describedby={id} tabIndex={0} className="inline-flex">
        {children}
      </span>
      <AnimatePresence>
        {open && (
          <motion.span
            id={id}
            role="tooltip"
            initial={{ opacity: 0, y: side === 'top' ? 4 : -4, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.12 }}
            className={cn(
              'pointer-events-none absolute left-1/2 z-50 w-max max-w-[220px] -translate-x-1/2 rounded-lg bg-ink px-2.5 py-1.5 text-center text-xs font-medium text-white shadow-soft',
              side === 'top' ? 'bottom-full mb-2' : 'top-full mt-2'
            )}
          >
            {content}
          </motion.span>
        )}
      </AnimatePresence>
    </span>
  );
}
