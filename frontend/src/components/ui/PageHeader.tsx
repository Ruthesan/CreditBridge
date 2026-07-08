import type { ReactNode } from 'react';
import { motion } from 'framer-motion';

export function PageHeader({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"
    >
      <div>
        {eyebrow && <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-primary">{eyebrow}</p>}
        <h1 className="text-2xl font-bold text-ink sm:text-3xl">{title}</h1>
        {description && <p className="mt-1.5 max-w-2xl text-sm text-ink-secondary">{description}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </motion.div>
  );
}
